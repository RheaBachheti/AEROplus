"use client"

// Firebase SDK imports
import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getDatabase, ref, onValue, set, push, query, orderByChild, limitToLast, type Database } from "firebase/database"

// Aero+ Firebase configuration - hardcoded with your database URL
const firebaseConfig = {
  apiKey: "AIzaSyDemo123",  // Public database rules don't need real API key
  authDomain: "aeroplus-b7205.firebaseapp.com",
  databaseURL: "https://aeroplus-b7205-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aeroplus-b7205",
  storageBucket: "aeroplus-b7205.appspot.com",
  messagingSenderId: "",
  appId: "",
}

// Lazy initialization - only initialize in browser
let app: FirebaseApp | null = null
let database: Database | null = null
let initialized = false

function initializeFirebase(): Database | null {
  // Only run in browser
  if (typeof window === "undefined") {
    return null
  }
  
  // Already initialized
  if (initialized && database) {
    return database
  }
  
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    database = getDatabase(app)
    initialized = true
    console.log("[Aero+] Firebase initialized successfully")
    return database
  } catch (error) {
    console.error("[Aero+] Firebase initialization failed:", error)
    initialized = true // Mark as attempted
    return null
  }
}

// Get database instance (lazy loaded)
export function getDb(): Database | null {
  return initializeFirebase()
}

// Create refs lazily - matching your ESP32 data structure
export function getSensorDataRef() {
  const db = getDb()
  return db ? ref(db, "sensorData") : null
}

// Individual sensor refs for direct access
export function getGasPPMRef() {
  const db = getDb()
  return db ? ref(db, "sensorData/gasPPM") : null
}

export function getTemperatureRef() {
  const db = getDb()
  return db ? ref(db, "sensorData/temperature") : null
}

export function getHumidityRef() {
  const db = getDb()
  return db ? ref(db, "sensorData/humidity") : null
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
  gasPPM: number       // MQ-2 gas sensor value (PPM) - matches your ESP32 field name
  temperature: number  // DHT11 temperature (Celsius)
  humidity: number     // DHT11 humidity (%)
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

// Calculate AQI from gas PPM, temperature and humidity
export function calculateAQI(gasPPM: number, temp: number, humidity: number): number {
  // MQ-2 sensor typically reads 200-10000 PPM for various gases
  // We'll normalize this to an AQI-like scale (0-500)
  
  // Base score from gas sensor
  // Normal air: 200-400 PPM -> AQI 0-50 (Good)
  // Slightly polluted: 400-800 PPM -> AQI 50-100 (Moderate)  
  // Polluted: 800-1500 PPM -> AQI 100-150 (Unhealthy for Sensitive)
  // Very polluted: 1500-3000 PPM -> AQI 150-200 (Unhealthy)
  // Dangerous: 3000+ PPM -> AQI 200+ (Very Unhealthy/Hazardous)
  
  let gasScore: number
  if (gasPPM <= 200) {
    gasScore = 0
  } else if (gasPPM <= 400) {
    gasScore = ((gasPPM - 200) / 200) * 50
  } else if (gasPPM <= 800) {
    gasScore = 50 + ((gasPPM - 400) / 400) * 50
  } else if (gasPPM <= 1500) {
    gasScore = 100 + ((gasPPM - 800) / 700) * 50
  } else if (gasPPM <= 3000) {
    gasScore = 150 + ((gasPPM - 1500) / 1500) * 50
  } else {
    gasScore = 200 + ((gasPPM - 3000) / 7000) * 300
  }
  
  // Temperature factor (optimal 20-26°C)
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
