// app/api/domains/select/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { selectDomainsSchema } from "@/lib/validations";
import { getOrCreateUser } from "@/lib/user-service";

export async function POST(request: Request) {
  try {
    const user = await getOrCreateUser(); // DB user
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { domainIds } = selectDomainsSchema.parse(body);

    // Check if domains are already locked (DB id)
    const existingDomains = await prisma.userDomain.findMany({
      where: { userId: user.id, locked: true },
      select: { domainId: true },
    });

    if (existingDomains.length > 0) {
      return NextResponse.json(
        { error: "Domains are already locked and cannot be changed." },
        { status: 400 }
      );
    }

    // Lock the selected domains (DB id)
    await prisma.userDomain.createMany({
      data: domainIds.map((domainId: string) => ({
        userId: user.id,
        domainId,
        locked: true,
      })),
    });

    return NextResponse.json({ message: "Domains locked successfully." });
  } catch (error) {
    console.error("POST /api/domains/select error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
