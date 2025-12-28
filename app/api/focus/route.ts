import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

function clampHours(hours: number) {
  if (Number.isNaN(hours)) return 0;
  return Math.max(0, Math.min(12, hours));
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const rawHours = Number(body.hours);

    if (!Number.isFinite(rawHours)) {
      return NextResponse.json({ error: "Invalid hours" }, { status: 400 });
    }

    if (rawHours > 12) {
      return NextResponse.json({ error: "Hours cannot exceed 12" }, { status: 400 });
    }

    const hours = clampHours(rawHours);

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Compute tasks stats for today
    const [completedTasks, failedTasks] = await Promise.all([
      prisma.task.count({
        where: {
          userId: user.id,
          status: "completed",
          result: "success",
          completedAt: { gte: today, lt: tomorrow },
        },
      }),
      prisma.task.count({
        where: {
          userId: user.id,
          status: { in: ["failed", "cheated"] },
          completedAt: { gte: today, lt: tomorrow },
        },
      }),
    ]);

    // Upsert daily review for today, storing hoursFocused
    const review = await prisma.dailyReview.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      update: {
        hoursFocused: hours,
        tasksCompleted: completedTasks,
        tasksFailed: failedTasks,
      },
      create: {
        userId: user.id,
        date: today,
        overallSatisfaction: 3,
        hoursFocused: hours,
        tasksCompleted: completedTasks,
        tasksFailed: failedTasks,
      },
    });

    const totalHoursFocused = await prisma.dailyReview.aggregate({
      where: { userId: user.id },
      _sum: { hoursFocused: true },
    });

    return NextResponse.json({
      success: true,
      review,
      totalHoursFocused: totalHoursFocused._sum.hoursFocused ?? 0,
    });
  } catch (error) {
    console.error("POST /api/focus error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayReview = await prisma.dailyReview.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      select: { hoursFocused: true },
    });

    const totalHoursFocused = await prisma.dailyReview.aggregate({
      where: { userId: user.id },
      _sum: { hoursFocused: true },
    });

    const todayHoursFocused = todayReview?.hoursFocused;
    const hasLoggedToday = todayReview?.hoursFocused !== null && todayReview?.hoursFocused !== undefined;

    return NextResponse.json({
      totalHoursFocused: totalHoursFocused._sum.hoursFocused ?? 0,
      todayHoursFocused: todayHoursFocused ?? null,
      hasLoggedToday,
    });
  } catch (error) {
    console.error("GET /api/focus error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
