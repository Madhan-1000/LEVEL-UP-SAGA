import { NextResponse } from "next/server";
import { syncUser } from "@/lib/user-sync";

export async function GET() {
  try {
    const user = await syncUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    console.log("User successfully synced to DB:", user.clerkId);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
