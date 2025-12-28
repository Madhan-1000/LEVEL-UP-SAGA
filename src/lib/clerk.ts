import { clerkClient } from '@clerk/nextjs/server'

export { clerkClient }

// Clerk configuration constants
export const CLERK_CONFIG = {
  // Routes that require authentication
  protectedRoutes: [
    '/dashboard',
    '/onboarding',
    '/api/tasks',
    '/api/progress',
    '/api/achievements',
    '/api/reviews',
    '/api/domains',
    '/api/analytics',
  ],

  // Routes that are public
  publicRoutes: [
    '/',
    '/auth',
  ],

  // Redirect URLs
  signInUrl: '/auth/sign-in',
  signUpUrl: '/auth/sign-up',
  afterSignInUrl: '/onboarding',
  afterSignUpUrl: '/onboarding',
}
