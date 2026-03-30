"use client"

import { useEffect, useState, useCallback } from "react"
import {
  subscribeToValue,
  calculateAQI,
  type SensorData,
  type DeviceStatus,
  type Alert,
} from "@/lib/firebase"

function generateDemoData(): SensorData {
  const baseGas = 0.25 + Math.random() * 0.5 // 0.25-0.75 PPM for demo
  const baseTemp = 24 + Math.random() * 4
  const baseHumidity = 50 + Math.random() * 15
  
  return {
    gasPPM: Math.round(baseGas * 100) / 100,
    temperature: Math.round(baseTemp * 10) / 10,
    humidity: Math.round(baseHumidity),
    timestamp: Date.now(),
  }
}

function generateDemoHistory(): SensorData[] {
  const history: SensorData[] = []
  const now = Date.now()
  
  for (let i = 24; i >= 0; i--) {
    const hourOffset = i * 60 * 60 * 1000
    const hour = new Date(now - hourOffset).getHours()
    const isCookingTime = (hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 21)
    
    history.push({
      gasPPM: Math.round((0.2 + (isCookingTime ? 0.6 : 0.2) + Math.random() * 0.3) * 100) / 100,
      temperature: Math.round((22 + Math.sin(hour / 24 * Math.PI) * 4 + Math.random() * 2) * 10) / 10,
      humidity: Math.round(45 + Math.cos(hour / 24 * Math.PI) * 10 + Math.random() * 5),
      timestamp: now - hourOffset,
    })
  }
  
  return history
}

// Outdoor AQI data by Indian state
const outdoorAQIByState: Record<string, number> = {
  "Delhi": 280, "Maharashtra": 145, "Karnataka": 85, "Tamil Nadu": 95,
  "Gujarat": 165, "Uttar Pradesh": 245, "West Bengal": 175, "Rajasthan": 155,
  "Punjab": 195, "Haryana": 210, "Kerala": 55, "Goa": 45,
  "Himachal Pradesh": 42, "Uttarakhand": 65, "Sikkim": 35, "Andhra Pradesh": 110,
  "Telangana": 125, "Bihar": 220, "Jharkhand": 185, "Odisha": 120,
  "Chhattisgarh": 140, "Madhya Pradesh": 150, "Assam": 90, "Meghalaya": 48,
  "Manipur": 52, "Mizoram": 38, "Nagaland": 45, "Tripura": 75,
  "Arunachal Pradesh": 32, "Chandigarh": 135, "Puducherry": 70,
  "Jammu and Kashmir": 72, "Ladakh": 28, "Andaman and Nicobar Islands": 25,
  "Lakshadweep": 22, "Dadra and Nagar Haveli and Daman and Diu": 95,
}

export function useSensorData() {
  const [currentData, setCurrentData] = useState<SensorData | null>(null)
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    isOnline: false,
    buzzerActive: false,
    lastSeen: Date.now(),
  })
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [history, setHistory] = useState<SensorData[]>([])
  const [isDemo, setIsDemo] = useState(true)
  const [connectionAttempted, setConnectionAttempted] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    let unsubscribers: (() => void)[] = []
    let firebaseConnected = false
    let gasPPM = 0
    let temperature = 0
    let humidity = 0

    const updateData = () => {
      if (gasPPM > 0 || temperature > 0 || humidity > 0) {
        firebaseConnected = true
        setIsDemo(false)
        setCurrentData({
          gasPPM,
          temperature,
          humidity,
          timestamp: Date.now(),
        })
        setDeviceStatus(prev => ({ ...prev, isOnline: true, lastSeen: Date.now() }))
      }
    }

    const connectToFirebase = async () => {
      console.log("[Aero+] Connecting to Firebase...")

      // Timeout for demo mode fallback
      const timeout = setTimeout(() => {
        if (!firebaseConnected) {
          console.log("[Aero+] Timeout - using demo mode")
          setIsDemo(true)
          setConnectionAttempted(true)
        }
      }, 8000)

      // Subscribe to gasPPM
      const unsubGas = await subscribeToValue("sensorData/gasPPM", (value) => {
        if (value !== null) {
          gasPPM = Number(value)
          console.log("[Aero+] PPM Value from Firebase:", gasPPM)
          clearTimeout(timeout)
          updateData()
        }
        setConnectionAttempted(true)
      })
      unsubscribers.push(unsubGas)

      // Subscribe to temperature
      const unsubTemp = await subscribeToValue("sensorData/temperature", (value) => {
        if (value !== null) {
          temperature = Number(value)
          updateData()
        }
      })
      unsubscribers.push(unsubTemp)

      // Subscribe to humidity
      const unsubHumid = await subscribeToValue("sensorData/humidity", (value) => {
        if (value !== null) {
          humidity = Number(value)
          updateData()
        }
      })
      unsubscribers.push(unsubHumid)

      // Also try full sensorData object
      const unsubAll = await subscribeToValue("sensorData", (data) => {
        if (data && typeof data === "object") {
          const d = data as Record<string, unknown>
          firebaseConnected = true
          clearTimeout(timeout)
          setIsDemo(false)
          setCurrentData({
            gasPPM: Number(d.gasPPM ?? d.gas ?? 0),
            temperature: Number(d.temperature ?? d.temp ?? 0),
            humidity: Number(d.humidity ?? 0),
            timestamp: Number(d.timestamp ?? Date.now()),
          })
          setDeviceStatus(prev => ({ ...prev, isOnline: true, lastSeen: Date.now() }))
        }
        setConnectionAttempted(true)
      })
      unsubscribers.push(unsubAll)

      // Subscribe to device status
      const unsubDevice = await subscribeToValue("deviceStatus", (data) => {
        if (data && typeof data === "object") {
          setDeviceStatus(data as DeviceStatus)
        }
      })
      unsubscribers.push(unsubDevice)

      // Subscribe to alerts
      const unsubAlerts = await subscribeToValue("alerts", (data) => {
        if (data && typeof data === "object") {
          const alertsList = Object.entries(data).map(([id, alert]) => ({
            id,
            ...(alert as Omit<Alert, "id">),
          })).sort((a, b) => b.timestamp - a.timestamp)
          setAlerts(alertsList)
        }
      })
      unsubscribers.push(unsubAlerts)

      return () => {
        clearTimeout(timeout)
      }
    }

    // Small delay for hydration
    const initDelay = setTimeout(() => {
      connectToFirebase()
    }, 200)

    return () => {
      clearTimeout(initDelay)
      unsubscribers.forEach(unsub => unsub())
    }
  }, [])

  // Demo mode simulation
  useEffect(() => {
    if (!isDemo || !connectionAttempted) return

    console.log("[Aero+] Running in demo mode")
    setCurrentData(generateDemoData())
    setHistory(generateDemoHistory())
    setDeviceStatus({ isOnline: true, buzzerActive: false, lastSeen: Date.now() })
    
    const interval = setInterval(() => {
      const newData = generateDemoData()
      setCurrentData(newData)
      
      setHistory(prev => {
        const updated = [...prev, newData]
        if (updated.length > 25) updated.shift()
        return updated
      })
      
      if (newData.gasPPM > 0.8) {
        setDeviceStatus(prev => ({ ...prev, buzzerActive: true }))
        setAlerts(prev => [{
          id: Date.now().toString(),
          type: "high_gas",
          message: "HIGH GAS: VENTILATE NOW",
          timestamp: Date.now(),
          acknowledged: false,
        }, ...prev.slice(0, 4)])
      } else {
        setDeviceStatus(prev => ({ ...prev, buzzerActive: false }))
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isDemo, connectionAttempted])

  // Calculate AQI using your formula: gasPPM * 100
  const indoorAQI = currentData ? calculateAQI(currentData.gasPPM) : 0

  const getOutdoorAQI = useCallback((location: string): number => {
    const baseAQI = outdoorAQIByState[location] || 100
    return Math.round(baseAQI + (Math.random() * 20 - 10))
  }, [])

  return {
    currentData,
    deviceStatus,
    alerts,
    history,
    indoorAQI,
    getOutdoorAQI,
    isDemo,
  }
}
