"use client"

import { useEffect, useState, useCallback } from "react"
import {
  getDb,
  getSensorDataRef,
  getDeviceStatusRef,
  getAlertsRef,
  getSensorHistoryRef,
  ref,
  onValue,
  type SensorData,
  type DeviceStatus,
  type Alert,
  calculateAQI,
} from "@/lib/firebase"

function generateDemoData(): SensorData {
  // Simulate realistic sensor fluctuations
  const baseGas = 150 + Math.random() * 100
  const baseTemp = 24 + Math.random() * 4
  const baseHumidity = 50 + Math.random() * 15
  
  return {
    gas: Math.round(baseGas),
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
    // Create realistic patterns - higher gas during cooking times (morning/evening)
    const hour = new Date(now - hourOffset).getHours()
    const isCookingTime = (hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 21)
    
    history.push({
      gas: Math.round(100 + (isCookingTime ? 200 : 50) + Math.random() * 80),
      temperature: Math.round((22 + Math.sin(hour / 24 * Math.PI) * 4 + Math.random() * 2) * 10) / 10,
      humidity: Math.round(45 + Math.cos(hour / 24 * Math.PI) * 10 + Math.random() * 5),
      timestamp: now - hourOffset,
    })
  }
  
  return history
}

// Outdoor AQI data by Indian state (simulated - in production, use a real API)
const outdoorAQIByState: Record<string, number> = {
  "Delhi": 280,
  "Maharashtra": 145,
  "Karnataka": 85,
  "Tamil Nadu": 95,
  "Gujarat": 165,
  "Uttar Pradesh": 245,
  "West Bengal": 175,
  "Rajasthan": 155,
  "Punjab": 195,
  "Haryana": 210,
  "Kerala": 55,
  "Goa": 45,
  "Himachal Pradesh": 42,
  "Uttarakhand": 65,
  "Sikkim": 35,
  "Andhra Pradesh": 110,
  "Telangana": 125,
  "Bihar": 220,
  "Jharkhand": 185,
  "Odisha": 120,
  "Chhattisgarh": 140,
  "Madhya Pradesh": 150,
  "Assam": 90,
  "Meghalaya": 48,
  "Manipur": 52,
  "Mizoram": 38,
  "Nagaland": 45,
  "Tripura": 75,
  "Arunachal Pradesh": 32,
  // Union Territories
  "Chandigarh": 135,
  "Puducherry": 70,
  "Jammu and Kashmir": 72,
  "Ladakh": 28,
  "Andaman and Nicobar Islands": 25,
  "Lakshadweep": 22,
  "Dadra and Nagar Haveli and Daman and Diu": 95,
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

  // Try to connect to Firebase, fall back to demo mode
  useEffect(() => {
    if (typeof window === "undefined") return
    
    const db = getDb()
    const sensorRef = getSensorDataRef()
    
    // If Firebase isn't available, use demo mode
    if (!db || !sensorRef) {
      setIsDemo(true)
      setConnectionAttempted(true)
      return
    }

    // Try to connect to Firebase
    let firebaseConnected = false
    const timeout = setTimeout(() => {
      if (!firebaseConnected) {
        // Firebase didn't respond in time, switch to demo mode
        setIsDemo(true)
        setConnectionAttempted(true)
      }
    }, 5000)

    // Listen to current sensor data
    const unsubscribeSensor = onValue(sensorRef, (snapshot) => {
      firebaseConnected = true
      clearTimeout(timeout)
      const data = snapshot.val()
      if (data) {
        setCurrentData(data)
        setIsDemo(false)
        setDeviceStatus(prev => ({ ...prev, isOnline: true, lastSeen: Date.now() }))
      }
      setConnectionAttempted(true)
    }, (error) => {
      console.error("[Aero+] Firebase sensor data error:", error)
      setIsDemo(true)
      setConnectionAttempted(true)
    })

    // Listen to device status
    const deviceRef = getDeviceStatusRef()
    let unsubscribeDevice = () => {}
    if (deviceRef) {
      unsubscribeDevice = onValue(deviceRef, (snapshot) => {
        const status = snapshot.val()
        if (status) {
          setDeviceStatus(status)
        }
      }, (error) => {
        console.error("[Aero+] Firebase device status error:", error)
      })
    }

    // Listen to alerts
    const alertRef = getAlertsRef()
    let unsubscribeAlerts = () => {}
    if (alertRef) {
      unsubscribeAlerts = onValue(alertRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const alertsList = Object.entries(data).map(([id, alert]: [string, unknown]) => ({
            id,
            ...(alert as Omit<Alert, 'id'>),
          })).sort((a, b) => b.timestamp - a.timestamp)
          setAlerts(alertsList)
        }
      }, (error) => {
        console.error("[Aero+] Firebase alerts error:", error)
      })
    }

    // Listen to history
    const histRef = getSensorHistoryRef()
    let unsubscribeHistory = () => {}
    if (histRef) {
      unsubscribeHistory = onValue(histRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const historyList = Object.values(data) as SensorData[]
          setHistory(historyList.sort((a, b) => a.timestamp - b.timestamp))
        }
      }, (error) => {
        console.error("[Aero+] Firebase history error:", error)
      })
    }

    return () => {
      clearTimeout(timeout)
      unsubscribeSensor()
      unsubscribeDevice()
      unsubscribeAlerts()
      unsubscribeHistory()
    }
  }, [])

  // Demo mode simulation - only runs when in demo mode
  useEffect(() => {
    if (!isDemo || !connectionAttempted) return

    // Initialize with demo data
    setCurrentData(generateDemoData())
    setHistory(generateDemoHistory())
    setDeviceStatus({ isOnline: true, buzzerActive: false, lastSeen: Date.now() })
    
    // Update every 5 seconds
    const interval = setInterval(() => {
      const newData = generateDemoData()
      setCurrentData(newData)
      
      // Add to history (keep last 24 hours)
      setHistory(prev => {
        const updated = [...prev, newData]
        if (updated.length > 25) updated.shift()
        return updated
      })
      
      // Check for high gas alert (occasionally trigger for demo)
      if (newData.gas > 300) {
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

  // Calculate indoor AQI from sensor data
  const indoorAQI = currentData 
    ? calculateAQI(currentData.gas, currentData.temperature, currentData.humidity)
    : 0

  // Get outdoor AQI for location
  const getOutdoorAQI = useCallback((location: string): number => {
    // Add some variation to make it feel live
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
