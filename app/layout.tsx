import type { Metadata } from 'next'
import './globals.css'
import { QueryProvider } from '@/components/QueryProvider'
import { CyberHeader } from '@/components/CyberHeader'
import { ClerkProvider } from '@clerk/nextjs'
import UserGreeting from './UserGreeting'
import { PageTransition } from '@/components/PageTransition'

export const metadata: Metadata = {
  title: 'Level Up Saga',
  description: 'Cyberpunk gamified self-improvement',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="font-rajdhani bg-background text-foreground antialiased">
          <CyberHeader />
          <UserGreeting />
          <QueryProvider>
            <PageTransition>
              <main className="pt-16">{children}</main>
            </PageTransition>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
