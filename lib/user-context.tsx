"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface UserProfile {
  name: string
  age: number
  disease: string
  location: string // Indian State/UT
  daysActive: number
  createdAt: number
}

interface UserContextType {
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void
  isOnboarded: boolean
  setIsOnboarded: (value: boolean) => void
  showSplash: boolean
  setShowSplash: (value: boolean) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const USER_STORAGE_KEY = "aeroplus_user"
const ONBOARDED_KEY = "aeroplus_onboarded"

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null)
  const [isOnboarded, setIsOnboardedState] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY)
    const onboarded = localStorage.getItem(ONBOARDED_KEY)
    
    if (savedUser) {
      const parsed = JSON.parse(savedUser) as UserProfile
      // Calculate days active
      const daysActive = Math.floor((Date.now() - parsed.createdAt) / (1000 * 60 * 60 * 24))
      setUserState({ ...parsed, daysActive })
    }
    
    if (onboarded === "true") {
      setIsOnboardedState(true)
    }
    
    setIsHydrated(true)
  }, [])

  const setUser = (newUser: UserProfile | null) => {
    setUserState(newUser)
    if (newUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  }

  const setIsOnboarded = (value: boolean) => {
    setIsOnboardedState(value)
    localStorage.setItem(ONBOARDED_KEY, value.toString())
  }

  if (!isHydrated) {
    return null
  }

  return (
    <UserContext.Provider value={{ user, setUser, isOnboarded, setIsOnboarded, showSplash, setShowSplash }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

// Indian States and Union Territories
export const indianLocations = [
  // States
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
]

// Common respiratory/health conditions
export const healthConditions = [
  "None",
  "Asthma",
  "COPD",
  "Bronchitis",
  "Allergies",
  "Sinusitis",
  "Pneumonia History",
  "Heart Condition",
  "Diabetes",
  "Hypertension",
  "Other Respiratory",
]
