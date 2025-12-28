import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user-service";

function startOfUtcDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = new URL(request.url).searchParams;
    const dayParam = searchParams.get("day");
    const day = dayParam ? new Date(`${dayParam}T00:00:00Z`) : new Date();
    const dayBucket = startOfUtcDay(day);
    const nextDay = new Date(dayBucket);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const entries = await prisma.timelineEntry.findMany({
      where: {
        userId: user.id,
        day: { gte: dayBucket, lt: nextDay },
      },
      orderBy: [{ occurredAt: "asc" }],
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("GET /api/timeline error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : undefined;
    const kind = typeof body.kind === "string" ? body.kind.trim() : undefined;
    const dayParam = typeof body.day === "string" ? body.day : undefined;

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const occurredAt = body.occurredAt ? new Date(body.occurredAt) : new Date();
    if (Number.isNaN(occurredAt.getTime())) {
      return NextResponse.json({ error: "Invalid occurredAt timestamp." }, { status: 400 });
    }

    const requestedDay = dayParam ? new Date(`${dayParam}T00:00:00Z`) : null;
    if (requestedDay && Number.isNaN(requestedDay.getTime())) {
      return NextResponse.json({ error: "Invalid day value." }, { status: 400 });
    }

    const day = startOfUtcDay(requestedDay || occurredAt);
    const today = startOfUtcDay(new Date());
    const diffMs = Math.abs(day.getTime() - today.getTime());

    // Allow today plus/minus one day to tolerate timezone offsets, block further
    if (diffMs > 86_400_000) {
      return NextResponse.json({ error: "Cannot add entries outside of the current day." }, { status: 400 });
    }

    const entry = await prisma.timelineEntry.create({
      data: {
        userId: user.id,
        title,
        description,
        kind,
        occurredAt,
        day,
      },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("POST /api/timeline error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const id = typeof body.id === "string" ? body.id : null;

    if (!id) {
      return NextResponse.json({ error: "Missing entry id." }, { status: 400 });
    }

    const existing = await prisma.timelineEntry.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }

    await prisma.timelineEntry.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/timeline error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
