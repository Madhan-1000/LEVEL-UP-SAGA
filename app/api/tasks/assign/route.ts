// app/api/tasks/assign/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user-service";
import { assignTasksToUser, shouldAssignNewTasks } from "@/lib/task-assignment";

export async function POST() {
  try {
    const clerkId = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getOrCreateUser(); // returns DB user row
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Expire any previous-day pending/active tasks
    await prisma.task.updateMany({
      where: {
        userId: user.id,
        status: { in: ["pending", "active"] },
        assignedAt: { lt: today },
      },
      data: {
        status: "failed",
        result: "failure",
        completedAt: new Date(),
      },
    });

    // Check today's tasks
    const todayTasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        assignedAt: { gte: today, lt: tomorrow },
      },
      select: { status: true },
    });

    if (todayTasks.length > 0) {
      const completedCount = todayTasks.filter((t) => t.status === "completed").length;
      if (completedCount === todayTasks.length) {
        return NextResponse.json({ message: "All tasks for today are completed.", assigned: [] });
      }
      return NextResponse.json({ message: "Tasks already assigned for today.", assigned: [] }, { status: 400 });
    }

    const needsTasks = await shouldAssignNewTasks(user.id); // ✅ DB id
    if (!needsTasks) {
      return NextResponse.json({ message: "User already has sufficient active tasks.", assigned: [] });
    }

    const assigned = await assignTasksToUser(user.id); // ✅ DB id
    return NextResponse.json({ message: `Assigned ${assigned.length} new tasks`, assigned });
  } catch (error) {
    console.error("POST /api/tasks/assign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
