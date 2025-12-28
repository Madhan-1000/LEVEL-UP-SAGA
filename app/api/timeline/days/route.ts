import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user-service";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await prisma.timelineEntry.findMany({
      where: { userId: user.id },
      select: { day: true },
      distinct: ["day"],
      orderBy: { day: "desc" },
    });

    const days = rows.map((r) => r.day.toISOString());
    return NextResponse.json({ days });
  } catch (error) {
    console.error("GET /api/timeline/days error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
