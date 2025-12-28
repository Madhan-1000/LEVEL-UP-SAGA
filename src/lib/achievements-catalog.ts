import { Achievement } from "@prisma/client";

type Grade = "bronze" | "silver" | "gold" | "platinum";
type Difficulty = "easy" | "standard" | "challenging" | "legendary";

type Requirement =
  | { type: "completedTasks"; count: number }
  | { type: "streak"; minStreak: number }
  | { type: "level"; minLevel: number }
  | { type: "domainTasks"; domainName: string; minDomainTasks: number };

export interface CatalogAchievement {
  id: string;
  name: string;
  description: string;
  grade: Grade;
  difficulty: Difficulty;
  type: Achievement["type"];
  xpBonus: number;
  icon: string;
  requirements: Requirement;
  domainName?: string;
}

const gradeXp: Record<Grade, number> = {
  bronze: 50,
  silver: 100,
  gold: 175,
  platinum: 300,
};

const generalAchievements: CatalogAchievement[] = [
  {
    id: "the_spark",
    name: "THE SPARK",
    description: "Start your run.",
    grade: "bronze",
    difficulty: "easy",
    type: "general",
    xpBonus: gradeXp.bronze,
    icon: "Sparkles",
    requirements: { type: "completedTasks", count: 1 },
  },
  {
    id: "steady_hands",
    name: "STEADY HANDS",
    description: "Consistency over intensity.",
    grade: "bronze",
    difficulty: "standard",
    type: "general",
    xpBonus: gradeXp.bronze,
    icon: "Hand",
    requirements: { type: "completedTasks", count: 30 },
  },
  {
    id: "the_grinder",
    name: "THE GRINDER",
    description: "You keep showing up.",
    grade: "silver",
    difficulty: "standard",
    type: "general",
    xpBonus: gradeXp.silver,
    icon: "Cog",
    requirements: { type: "completedTasks", count: 100 },
  },
  {
    id: "the_architect",
    name: "THE ARCHITECT",
    description: "You built a system, not a mood.",
    grade: "gold",
    difficulty: "challenging",
    type: "general",
    xpBonus: gradeXp.gold,
    icon: "Building2",
    requirements: { type: "completedTasks", count: 250 },
  },
  {
    id: "the_machine",
    name: "THE MACHINE",
    description: "Scale is inevitable now.",
    grade: "platinum",
    difficulty: "legendary",
    type: "general",
    xpBonus: gradeXp.platinum,
    icon: "Cpu",
    requirements: { type: "completedTasks", count: 500 },
  },
  {
    id: "comeback_engine",
    name: "THE COMEBACK ENGINE",
    description: "Reach a current streak of 3 at least once.",
    grade: "bronze",
    difficulty: "easy",
    type: "streak_based",
    xpBonus: gradeXp.bronze,
    icon: "Flame",
    requirements: { type: "streak", minStreak: 3 },
  },
  {
    id: "overcame_adversity",
    name: "ONE WHO OVERCAME ADVERSITY",
    description: "Reach a current streak of 7 at least once.",
    grade: "silver",
    difficulty: "standard",
    type: "streak_based",
    xpBonus: gradeXp.silver,
    icon: "Shield",
    requirements: { type: "streak", minStreak: 7 },
  },
  {
    id: "streak_killer",
    name: "STREAK KILLER",
    description: "Reach a current streak of 14 at least once.",
    grade: "gold",
    difficulty: "challenging",
    type: "streak_based",
    xpBonus: gradeXp.gold,
    icon: "Zap",
    requirements: { type: "streak", minStreak: 14 },
  },
  {
    id: "unbreakable_core",
    name: "UNBREAKABLE CORE",
    description: "Reach a current streak of 30 at least once.",
    grade: "platinum",
    difficulty: "legendary",
    type: "streak_based",
    xpBonus: gradeXp.platinum,
    icon: "ShieldCheck",
    requirements: { type: "streak", minStreak: 30 },
  },
  {
    id: "level_up_initiate",
    name: "LEVEL UP INITIATE",
    description: "Reach Level 5.",
    grade: "bronze",
    difficulty: "easy",
    type: "level_based",
    xpBonus: gradeXp.bronze,
    icon: "ArrowUpCircle",
    requirements: { type: "level", minLevel: 5 },
  },
  {
    id: "elite_operator",
    name: "ELITE OPERATOR",
    description: "Reach Level 20.",
    grade: "silver",
    difficulty: "standard",
    type: "level_based",
    xpBonus: gradeXp.silver,
    icon: "Medal",
    requirements: { type: "level", minLevel: 20 },
  },
  {
    id: "veteran",
    name: "VETERAN",
    description: "Reach Level 35.",
    grade: "gold",
    difficulty: "challenging",
    type: "level_based",
    xpBonus: gradeXp.gold,
    icon: "Trophy",
    requirements: { type: "level", minLevel: 35 },
  },
  {
    id: "legend",
    name: "LEGEND",
    description: "Reach Level 50.",
    grade: "platinum",
    difficulty: "legendary",
    type: "level_based",
    xpBonus: gradeXp.platinum,
    icon: "Crown",
    requirements: { type: "level", minLevel: 50 },
  },
];

const domainNames = [
  "Steel Body",
  "Knowledge Quest",
  "Code Craft",
  "Iron Cognitive Mind",
  "Sleeping Maniac",
  "Healthy Mind & Body",
  "Social Skills",
  "Zenith Wealth",
  "Superhuman Physicality",
  "Superhuman Mentality",
  "Typing",
  "Chess",
  "Home & Environment",
  "Spiritual & Reflection",
];

const gradeOrder: Grade[] = ["bronze", "silver", "gold", "platinum"];
const gradeDifficulty: Record<Grade, Difficulty> = {
  bronze: "easy",
  silver: "standard",
  gold: "challenging",
  platinum: "legendary",
};

const domainCounts = {
  bronze: 5,
  silver: 15,
  gold: 30,
  platinum: 60,
} as const;

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function buildDomainAchievements(): CatalogAchievement[] {
  const achievements: CatalogAchievement[] = [];

  for (const domainName of domainNames) {
    for (const grade of gradeOrder) {
      const count = domainCounts[grade];
      const difficulty = gradeDifficulty[grade];
      achievements.push({
        id: `${slugify(domainName)}_${grade}`,
        name: `${domainName.toUpperCase()} - ${grade.toUpperCase()}`,
        description:
          grade === "bronze"
            ? "You started building reps in this domain."
            : grade === "silver"
              ? "Consistency is visible now."
              : grade === "gold"
                ? "This domain is part of your identity."
                : "Master-level consistency in this domain.",
        grade,
        difficulty,
        type: "domain_specific",
        xpBonus: gradeXp[grade],
        icon: "Award",
        domainName,
        requirements: {
          type: "domainTasks",
          domainName,
          minDomainTasks: count,
        },
      });
    }
  }

  return achievements;
}

const domainAchievements = buildDomainAchievements();

export function getAchievementsCatalog(): CatalogAchievement[] {
  return [...generalAchievements, ...domainAchievements];
}

export function getCatalogMap() {
  const map = new Map<string, CatalogAchievement>();
  for (const ach of getAchievementsCatalog()) {
    map.set(ach.id, ach);
  }
  return map;
}
