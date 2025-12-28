// app/api/domains/locked/route.ts
import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user-service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getOrCreateUser(); // DB user
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lockedDomains = await prisma.userDomain.findMany({
      where: { userId: user.id, locked: true }, // ✅ DB id
      select: { id: true },
    });

    return NextResponse.json({ locked: lockedDomains.length > 0 });
  } catch (error) {
    console.error("GET /api/domains/locked error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
