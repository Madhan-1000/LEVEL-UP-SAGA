import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/help(.*)",
  "/auth(.*)",
])

const isApiRoute = createRouteMatcher(["/api/(.*)"])

const isAlwaysProtected = createRouteMatcher(["/(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return

  if (isAlwaysProtected(req)) {
    const { userId } = await auth()

    if (!userId) {
      if (isApiRoute(req)) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }

      const url = req.nextUrl.clone()
      url.pathname = "/auth/sign-in"
      url.searchParams.set("redirect_url", req.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|.*\\..*).*)",
    // Always run for API routes
    "/api/(.*)",
  ],
}
