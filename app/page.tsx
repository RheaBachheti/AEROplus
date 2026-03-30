"use client"

import { useUser } from "@/lib/user-context"
import { SplashScreen } from "@/components/splash-screen"
import { Onboarding } from "@/components/onboarding"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const { showSplash, setShowSplash, isOnboarded } = useUser()

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  if (!isOnboarded) {
    return <Onboarding />
  }

  return <Dashboard />
}
