// app/api/tasks/assign/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/user-service";
import { assignTasksToUser, shouldAssignNewTasks } from "@/lib/task-assignment";

export async function POST() {
  try {
    const clerkId = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const needsTasks = await shouldAssignNewTasks(user.id);
    if (!needsTasks) {
      return NextResponse.json({
        message: "User already has sufficient active tasks.",
        assigned: [],
      });
    }

    const assigned = await assignTasksToUser(user.id);

    return NextResponse.json({
      message: `Assigned ${assigned.length} new tasks`,
      assigned,
    });
  } catch (error) {
    console.error("POST /api/tasks/assign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
