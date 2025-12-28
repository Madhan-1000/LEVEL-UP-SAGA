// app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user-service";

export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;

    const status = searchParams.get("status") ?? undefined;

    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    const limit = Number.isFinite(Number(limitParam)) ? Number(limitParam) : 50;
    const offset = Number.isFinite(Number(offsetParam)) ? Number(offsetParam) : 0;

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        template: {
          include: {
            domain: true,
          },
        },
      },
      orderBy: [
        { deadlineAt: "asc" },
        { assignedAt: "asc" },
      ],
      take: limit,
      skip: offset,
    });

    // ✅ IMPORTANT: return { tasks } because your hooks expect data.tasks
    return NextResponse.json({ tasks });

  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
