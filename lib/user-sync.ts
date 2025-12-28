import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress || "";
  const userId = clerkUser.id;

  // This writes to your SQLite file.dev.db
  return await prisma.user.upsert({
    where: { clerkId: userId },
    update: { email },
    create: {
      clerkId: userId,
      email,
      username: clerkUser.username || `runner_${userId.slice(-8)}`,
      progress: {
        create: { currentLevel: 1, currentXp: 0, totalXpEarned: 0 }
      }
    }
  });
}
