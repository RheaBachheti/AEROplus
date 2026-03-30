"use client"

/**
 * Firebase configuration for Aero+ IoT App
 * All Firebase imports are DYNAMIC to prevent module-level initialization errors
 */

// Types for sensor data from ESP32
export interface SensorData {
  gasPPM: number
  temperature: number
  humidity: number
  timestamp?: number
}

export interface DeviceStatus {
  isOnline: boolean
  buzzerActive: boolean
  lastSeen: number
  oledMessage?: string
}

export interface Alert {
  id: string
  type: "high_gas" | "high_temp" | "low_humidity" | "device_offline"
  message: string
  timestamp: number
  acknowledged: boolean
}

// Firebase configuration for your Aero+ project
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDemo123",
  authDomain: "aeroplus-b7205.firebaseapp.com",
  databaseURL: "https://aeroplus-b7205-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aeroplus-b7205",
  storageBucket: "aeroplus-b7205.appspot.com",
  messagingSenderId: "",
  appId: "",
}

// State - lazy initialized
let firebaseApp: unknown = null
let database: unknown = null
let initialized = false
let initPromise: Promise<unknown> | null = null

// AQI calculation using your formula: gasPPM * 100
export function calculateAQI(gasPPM: number): number {
  if (!gasPPM || gasPPM <= 0) return 0
  return Math.round(gasPPM * 100)
}

export function getAQICategory(aqi: number): { label: string; color: string; description: string } {
  if (aqi <= 50) return { label: "Good", color: "#22c55e", description: "Air quality is satisfactory" }
  if (aqi <= 100) return { label: "Moderate", color: "#eab308", description: "Acceptable air quality" }
  if (aqi <= 150) return { label: "Unhealthy for Sensitive", color: "#f97316", description: "Sensitive groups may experience effects" }
  if (aqi <= 200) return { label: "Unhealthy", color: "#ef4444", description: "Everyone may experience health effects" }
  if (aqi <= 300) return { label: "Very Unhealthy", color: "#a855f7", description: "Health alert: significant risk" }
  return { label: "Hazardous", color: "#7f1d1d", description: "Emergency conditions" }
}

// Lazy initialization with dynamic imports
async function initializeFirebase(): Promise<unknown> {
  if (typeof window === "undefined") return null
  if (initialized && database) return database
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      const firebaseApp$ = await import("firebase/app")
      const firebaseDb$ = await import("firebase/database")

      const apps = firebaseApp$.getApps()
      firebaseApp = apps.length === 0 
        ? firebaseApp$.initializeApp(FIREBASE_CONFIG) 
        : apps[0]
      
      database = firebaseDb$.getDatabase(firebaseApp as never)
      initialized = true
      console.log("[Aero+] Firebase ready")
      return database
    } catch (err) {
      console.error("[Aero+] Firebase error:", err)
      initialized = true
      return null
    }
  })()

  return initPromise
}

// Subscribe to Firebase path
export async function subscribeToValue(
  path: string,
  onData: (value: unknown) => void,
  onError?: (error: Error) => void
): Promise<() => void> {
  if (typeof window === "undefined") return () => {}

  try {
    const db = await initializeFirebase()
    if (!db) {
      console.log("[Aero+] No database, skipping:", path)
      return () => {}
    }

    const { ref, onValue } = await import("firebase/database")
    const dataRef = ref(db as never, path)

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const val = snapshot.val()
        console.log(`[Aero+] ${path}:`, val)
        onData(val)
      },
      (error) => {
        console.error(`[Aero+] ${path} error:`, error)
        onError?.(error)
      }
    )

    return unsubscribe
  } catch (err) {
    console.error("[Aero+] Subscribe failed:", err)
    return () => {}
  }
}

export function isFirebaseAvailable(): boolean {
  return initialized && database !== null
}
