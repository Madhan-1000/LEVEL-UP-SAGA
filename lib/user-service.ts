import prisma from "@/lib/prisma"
import { auth, currentUser } from "@clerk/nextjs/server"

export async function getOrCreateUser() {
  const { userId } = await  auth()
  if (!userId) return null

  // currentUser() can be null if session is missing/invalid
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? null
  const username =
    clerkUser.username ?? `user_${userId.slice(-8)}`

  // Do not overwrite username on updates so user-edited name persists
  return prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email: email ?? undefined,
    },
    create: {
      clerkId: userId,
      email: email ?? undefined,
      username,
      progress: {
        create: {
          currentLevel: 1,
          currentXp: 0,
          totalXpEarned: 0,
        },
      },
    },
    include: {
      progress: true,
    },
  })
}
