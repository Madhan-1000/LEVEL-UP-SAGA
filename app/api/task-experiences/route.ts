import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const taskId = typeof body.taskId === "string" ? body.taskId : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const skipped = Boolean(body.skipped);

    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId }, select: { userId: true } });
    if (!task || task.userId !== user.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const experience = await prisma.taskExperience.upsert({
      where: { userId_taskId: { userId: user.id, taskId } },
      update: { content: skipped ? null : content || null, skipped },
      create: {
        userId: user.id,
        taskId,
        content: skipped ? null : content || null,
        skipped,
      },
    });

    return NextResponse.json({ success: true, experience });
  } catch (error) {
    console.error("POST /api/task-experiences error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
