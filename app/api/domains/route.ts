// app/api/domains/route.ts
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

type DomainsResponse = {
  domains: any[];
  userDomains: Array<{
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    locked: boolean;
  }>;
};

export async function GET() {
  const { userId: clerkId } = await auth();

  // Fetch all domains always
  const domains = await prisma.domain.findMany();

  // If not signed in, return empty selection
  if (!clerkId) {
    const res: DomainsResponse = { domains, userDomains: [] };
    return NextResponse.json(res);
  }

  // Find DB user (your UserDomain.userId points to this id)
  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!dbUser) {
    const res: DomainsResponse = { domains, userDomains: [] };
    return NextResponse.json(res);
  }

  const userDomains = await prisma.userDomain.findMany({
    where: { userId: dbUser.id },
    include: { domain: true },
  });

  const res: DomainsResponse = {
    domains,
    userDomains: userDomains.map((ud) => ({
      id: ud.domain.id,
      name: ud.domain.name,
      description: ud.domain.description,
      icon: ud.domain.icon,
      color: ud.domain.color,
      locked: ud.locked,
    })),
  };

  return NextResponse.json(res);
}

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const domainIdsRaw = body?.domainIds;

    if (!Array.isArray(domainIdsRaw)) {
      return NextResponse.json({ error: "domainIds must be an array" }, { status: 400 });
    }

    // Ensure exactly 2 unique domain ids
    const domainIds = Array.from(new Set(domainIdsRaw.map(String)));
    if (domainIds.length !== 2) {
      return NextResponse.json({ error: "Select exactly 2 unique domains" }, { status: 400 });
    }

    // Ensure DB user exists
    let dbUser = await prisma.user.findUnique({ where: { clerkId } });

    if (!dbUser) {
      const clerkUser = await currentUser();
      dbUser = await prisma.user.create({
        data: {
          clerkId,
          email: clerkUser?.emailAddresses?.[0]?.emailAddress || "",
          username: clerkUser?.username || `runner_${clerkId.slice(-8)}`,
          progress: {
            create: { currentLevel: 1, currentXp: 0, totalXpEarned: 0 },
          },
        },
      });
    }

    // If already locked, refuse to change (this is the actual lock)
    const lockedExisting = await prisma.userDomain.findMany({
      where: { userId: dbUser.id, locked: true },
      select: { domainId: true },
    });

    if (lockedExisting.length > 0) {
      return NextResponse.json(
        {
          error: "Domains are already locked and cannot be changed.",
          domainIds: lockedExisting.map((d) => d.domainId),
        },
        { status: 409 }
      );
    }

    // First-time selection only
    await prisma.userDomain.createMany({
      data: domainIds.map((domainId) => ({
        userId: dbUser.id,
        domainId,
        locked: true,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/domains error:", error);
    return NextResponse.json({ error: "Failed to save domains" }, { status: 500 });
  }
}
