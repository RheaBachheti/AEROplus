import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getDatabase, ref, onValue, set, push, query, orderByChild, limitToLast, type Database } from "firebase/database"

// Your Firebase configuration - hardcoded for Aero+ project
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: "aeroplus-b7205.firebaseapp.com",
  databaseURL: "https://aeroplus-b7205-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aeroplus-b7205",
  storageBucket: "aeroplus-b7205.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
}

// Lazy initialization to prevent server-side errors
let app: FirebaseApp | null = null
let database: Database | null = null

function initializeFirebase() {
  if (typeof window === "undefined") return null
  
  if (!app) {
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
      database = getDatabase(app)
    } catch (error) {
      console.error("[Aero+] Firebase initialization failed:", error)
      return null
    }
  }
  return database
}

// Get database instance (lazy loaded)
export function getDb(): Database | null {
  return initializeFirebase()
}

// Create refs lazily
export function getSensorDataRef() {
  const db = getDb()
  return db ? ref(db, "sensorData") : null
}

export function getSensorHistoryRef() {
  const db = getDb()
  return db ? ref(db, "sensorHistory") : null
}

export function getAlertsRef() {
  const db = getDb()
  return db ? ref(db, "alerts") : null
}

export function getDeviceStatusRef() {
  const db = getDb()
  return db ? ref(db, "deviceStatus") : null
}

// Types for sensor data from ESP32
export interface SensorData {
  gas: number        // MQ-2 gas sensor value (PPM)
  temperature: number // DHT11 temperature (Celsius)
  humidity: number   // DHT11 humidity (%)
  timestamp: number
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

// Helper functions
export function calculateAQI(gas: number, temp: number, humidity: number): number {
  // Simplified AQI calculation based on sensor data
  // Gas sensor (MQ-2) ranges roughly 0-10000 PPM
  // Convert to AQI scale (0-500)
  
  let gasScore = Math.min(500, (gas / 10000) * 500)
  
  // Temperature factor (optimal 20-25°C)
  let tempFactor = 1
  if (temp < 15 || temp > 35) tempFactor = 1.2
  else if (temp < 18 || temp > 30) tempFactor = 1.1
  
  // Humidity factor (optimal 40-60%)
  let humidityFactor = 1
  if (humidity < 30 || humidity > 70) humidityFactor = 1.15
  else if (humidity < 35 || humidity > 65) humidityFactor = 1.05
  
  const aqi = Math.round(gasScore * tempFactor * humidityFactor)
  return Math.min(500, Math.max(0, aqi))
}

export function getAQICategory(aqi: number): { label: string; color: string; description: string } {
  if (aqi <= 50) return { label: "Good", color: "#22c55e", description: "Air quality is satisfactory" }
  if (aqi <= 100) return { label: "Moderate", color: "#eab308", description: "Acceptable air quality" }
  if (aqi <= 150) return { label: "Unhealthy for Sensitive", color: "#f97316", description: "Sensitive groups may experience effects" }
  if (aqi <= 200) return { label: "Unhealthy", color: "#ef4444", description: "Everyone may experience health effects" }
  if (aqi <= 300) return { label: "Very Unhealthy", color: "#a855f7", description: "Health alert: significant risk" }
  return { label: "Hazardous", color: "#7f1d1d", description: "Emergency conditions" }
}

export { ref, onValue, set, push, query, orderByChild, limitToLast }
