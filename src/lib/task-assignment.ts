// src/lib/task-assignment.ts
import { prisma } from "./prisma";
import { buildNextDeadlineFromTime } from "./task-deadlines";

export interface TaskAssignment {
  taskId: string;
  templateId: string;
  domainId: string;
  xpReward: number;
  difficulty: string;
  timeLimit?: number;
}

const MAX_DOMAINS = 2;

// REQUIRED BY YOUR SPEC (per domain)
const TASKS_PER_DOMAIN = 5; // target per domain
const PERMANENT_PER_DOMAIN = 2;

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function selectWeightedTemplate(templates: any[], userLevel: number) {
  const weighted = templates.map((t) => {
    let w = 1;

    if (t.difficulty === "easy") {
      w = userLevel < 5 ? 3 : userLevel < 15 ? 2 : 1;
    } else if (t.difficulty === "medium") {
      w = userLevel < 5 ? 1 : userLevel < 15 ? 3 : userLevel < 25 ? 2 : 1;
    } else if (t.difficulty === "hard") {
      w = userLevel < 15 ? 0 : userLevel < 25 ? 1 : userLevel < 40 ? 2 : 3;
    }

    return { ...t, weight: Math.max(0, w) };
  });

  const total = weighted.reduce((sum, t) => sum + t.weight, 0);
  if (total <= 0) return weighted[0] ?? null;

  let r = Math.random() * total;
  for (const t of weighted) {
    r -= t.weight;
    if (r <= 0) return t;
  }
  return weighted[0] ?? null;
}

async function getUserLevel(userId: string) {
  const progress = await prisma.userProgress.findUnique({ where: { userId } });
  return progress?.currentLevel ?? 1;
}

async function getRecentCompletedTemplateIds(userId: string, domainId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recent = await prisma.task.findMany({
    where: {
      userId,
      status: "completed",
      completedAt: { gte: sevenDaysAgo },
      template: { domainId },
    },
    select: { templateId: true },
  });

  return recent.map((t) => t.templateId);
}

async function getActiveTemplatesAlreadyAssigned(userId: string, domainId: string) {
  const active = await prisma.task.findMany({
    where: {
      userId,
      status: { in: ["pending", "active"] },
      template: { domainId },
    },
    select: { templateId: true },
  });

  return active.map((t) => t.templateId);
}

async function getPermanentTemplates(domainId: string) {
  return prisma.taskTemplate.findMany({
    where: {
      domainId,
      isActive: true,
      isPermanent: true,
    },
    orderBy: { createdAt: "asc" as any }, // if createdAt exists; safe to remove if not
    take: PERMANENT_PER_DOMAIN,
  });
}

async function getRandomCandidateTemplates(userId: string, domainId: string) {
  const [recentCompletedIds, activeAssignedIds] = await Promise.all([
    getRecentCompletedTemplateIds(userId, domainId),
    getActiveTemplatesAlreadyAssigned(userId, domainId),
  ]);

  const blocked = uniq([...recentCompletedIds, ...activeAssignedIds]);

  return prisma.taskTemplate.findMany({
    where: {
      domainId,
      isActive: true,
      isPermanent: false,
      id: { notIn: blocked.length ? blocked : undefined },
    },
  });
}

async function getFallbackTemplates(domainId: string, excludeIds: string[]) {
  return prisma.taskTemplate.findMany({
    where: {
      domainId,
      isActive: true,
      isPermanent: false,
      id: { notIn: excludeIds.length ? excludeIds : undefined },
    },
  });
}

// Assign new tasks if any selected domain has less than TASKS_PER_DOMAIN pending/active
export async function shouldAssignNewTasks(userId: string): Promise<boolean> {
  const domains = await prisma.userDomain.findMany({
    where: { userId, locked: true },
    select: { domainId: true },
    take: MAX_DOMAINS,
  });

  if (!domains.length) return false;

  const counts = await prisma.task.groupBy({
    by: ["templateId"],
    where: {
      userId,
      status: { in: ["pending", "active"] },
    },
    _count: { _all: true },
  });

  // Quick lookup of templateId -> domainId
  const templateIds = counts.map((c) => c.templateId);
  const templates = templateIds.length
    ? await prisma.taskTemplate.findMany({
        where: { id: { in: templateIds } },
        select: { id: true, domainId: true },
      })
    : [];

  const templateToDomain = new Map(templates.map((t) => [t.id, t.domainId]));

  const perDomainActive = new Map<string, number>();
  for (const c of counts) {
    const domainId = templateToDomain.get(c.templateId);
    if (!domainId) continue;
    perDomainActive.set(domainId, (perDomainActive.get(domainId) ?? 0) + c._count._all);
  }

  for (const d of domains) {
    const activeCount = perDomainActive.get(d.domainId) ?? 0;
    if (activeCount < TASKS_PER_DOMAIN) return true;
  }

  return false;
}

export async function assignTasksToUser(userId: string): Promise<TaskAssignment[]> {
  const domains = await prisma.userDomain.findMany({
    where: { userId, locked: true },
    select: { domainId: true },
    take: MAX_DOMAINS,
  });

  if (!domains.length) {
    throw new Error("User has no locked domains selected.");
  }

  const userLevel = await getUserLevel(userId);
  const assignments: TaskAssignment[] = [];
  const now = new Date();

  for (const d of domains) {
    // Count existing pending/active tasks in this domain
    const existing = await prisma.task.count({
      where: {
        userId,
        status: { in: ["pending", "active"] },
        template: { domainId: d.domainId },
      },
    });

    const missing = Math.max(0, TASKS_PER_DOMAIN - existing);
    if (missing === 0) continue;

    // Permanent first (up to PERMANENT_PER_DOMAIN), but only if not already assigned
    const permanent = await getPermanentTemplates(d.domainId);
    const activeAssignedIds = await getActiveTemplatesAlreadyAssigned(userId, d.domainId);
    const activeSet = new Set(activeAssignedIds);

    const permanentToAssign = permanent
      .filter((t) => !activeSet.has(t.id))
      .slice(0, Math.min(PERMANENT_PER_DOMAIN, missing));

    // Random fill
    const remainingAfterPermanent = missing - permanentToAssign.length;
    const randomCandidates = await getRandomCandidateTemplates(userId, d.domainId);

    const chosenRandom: any[] = [];
    let pool = randomCandidates.slice();

    while (chosenRandom.length < remainingAfterPermanent && pool.length) {
      const picked = selectWeightedTemplate(pool, userLevel);
      if (!picked) break;
      chosenRandom.push(picked);
      pool = pool.filter((x) => x.id !== picked.id);
    }

    // If still short, allow fallback even if recently completed/blocked
    const stillMissing = missing - (permanentToAssign.length + chosenRandom.length);
    if (stillMissing > 0) {
      const excludeIds = new Set([...
        permanentToAssign.map((t) => t.id),
        ...chosenRandom.map((t) => t.id),
      ]);
      const fallbackPool = await getFallbackTemplates(d.domainId, Array.from(excludeIds));
      while (chosenRandom.length < remainingAfterPermanent && fallbackPool.length) {
        const picked = fallbackPool.shift();
        if (!picked) break;
        if (excludeIds.has(picked.id)) continue;
        chosenRandom.push(picked);
        excludeIds.add(picked.id);
      }
    }

    const finalTemplates = [...permanentToAssign, ...chosenRandom].slice(0, missing);

    for (const tpl of finalTemplates) {
      const deadlineAt =
        tpl.defaultDeadlineTime
          ? buildNextDeadlineFromTime(tpl.defaultDeadlineTime, now)
          : null;

      const task = await prisma.task.create({
        data: {
          userId,
          templateId: tpl.id,
          status: "pending",
          assignedAt: new Date(),
          deadlineAt: deadlineAt ?? undefined,
        },
      });

      assignments.push({
        taskId: task.id,
        templateId: tpl.id,
        domainId: d.domainId,
        xpReward: tpl.xpReward,
        difficulty: tpl.difficulty,
        timeLimit: tpl.config?.timeLimit,
      });
    }
  }

  return assignments;
}
