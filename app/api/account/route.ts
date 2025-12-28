import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  });
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await request.json().catch(() => ({}));
    if (payload.email) {
      return NextResponse.json({ error: "Email cannot be changed during early access." }, { status: 400 });
    }

    const username = typeof payload.username === "string" ? payload.username.trim() : undefined;

    if (username && (username.length < 3 || username.length > 32)) {
      return NextResponse.json({ error: "Username must be between 3 and 32 characters." }, { status: 400 });
    }

    if (!username) {
      return NextResponse.json({ error: "No changes supplied." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        username: username ?? undefined,
      },
    });

    return NextResponse.json({
      id: updated.id,
      username: updated.username,
      email: updated.email,
      createdAt: updated.createdAt,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "That username is taken. Try another." }, { status: 409 });
    }
    console.error("PATCH /api/account error", error);
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}
