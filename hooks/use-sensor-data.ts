"use client"

// Hook for real-time sensor data from Firebase
import { useEffect, useState, useCallback } from "react"
import {
  getDb,
  getGasPPMRef,
  getTemperatureRef,
  getHumidityRef,
  getSensorDataRef,
  getDeviceStatusRef,
  getAlertsRef,
  getSensorHistoryRef,
  onValue,
  type SensorData,
  type DeviceStatus,
  type Alert,
  calculateAQI,
} from "@/lib/firebase"

function generateDemoData(): SensorData {
  // Simulate realistic sensor fluctuations
  const baseGas = 250 + Math.random() * 150
  const baseTemp = 24 + Math.random() * 4
  const baseHumidity = 50 + Math.random() * 15
  
  return {
    gasPPM: Math.round(baseGas),
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
      gasPPM: Math.round(200 + (isCookingTime ? 400 : 100) + Math.random() * 150),
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

  // Try to connect to Firebase
  useEffect(() => {
    if (typeof window === "undefined") return
    
    // Small delay to ensure client-side hydration is complete
    const initTimeout = setTimeout(() => {
      const db = getDb()
      
      // If Firebase isn't available, use demo mode
      if (!db) {
        console.log("[Aero+] Firebase not available, using demo mode")
        setIsDemo(true)
        setConnectionAttempted(true)
        return
      }

      console.log("[Aero+] Attempting to connect to Firebase...")
      
      let firebaseConnected = false
      const connectionTimeout = setTimeout(() => {
        if (!firebaseConnected) {
          console.log("[Aero+] Firebase timeout, switching to demo mode")
          setIsDemo(true)
          setConnectionAttempted(true)
        }
      }, 8000)

      // Listen to individual sensor values (matching your ESP32 structure)
      const gasPPMRef = getGasPPMRef()
      const tempRef = getTemperatureRef()
      const humidRef = getHumidityRef()
      
      let gasPPM = 0
      let temperature = 0
      let humidity = 0

      const updateCurrentData = () => {
        if (gasPPM > 0 || temperature > 0 || humidity > 0) {
          firebaseConnected = true
          clearTimeout(connectionTimeout)
          setIsDemo(false)
          setCurrentData({
            gasPPM,
            temperature,
            humidity,
            timestamp: Date.now(),
          })
          setDeviceStatus(prev => ({ ...prev, isOnline: true, lastSeen: Date.now() }))
          console.log("[Aero+] Sensor data received:", { gasPPM, temperature, humidity })
        }
        setConnectionAttempted(true)
      }

      // Listen to gasPPM
      let unsubGas = () => {}
      if (gasPPMRef) {
        unsubGas = onValue(gasPPMRef, (snapshot) => {
          const value = snapshot.val()
          console.log("[Aero+] PPM Value from Firebase:", value)
          if (value !== null) {
            gasPPM = Number(value)
            updateCurrentData()
          }
        }, (error) => {
          console.error("[Aero+] Gas PPM read error:", error)
        })
      }

      // Listen to temperature
      let unsubTemp = () => {}
      if (tempRef) {
        unsubTemp = onValue(tempRef, (snapshot) => {
          const value = snapshot.val()
          console.log("[Aero+] Temperature from Firebase:", value)
          if (value !== null) {
            temperature = Number(value)
            updateCurrentData()
          }
        }, (error) => {
          console.error("[Aero+] Temperature read error:", error)
        })
      }

      // Listen to humidity
      let unsubHumid = () => {}
      if (humidRef) {
        unsubHumid = onValue(humidRef, (snapshot) => {
          const value = snapshot.val()
          console.log("[Aero+] Humidity from Firebase:", value)
          if (value !== null) {
            humidity = Number(value)
            updateCurrentData()
          }
        }, (error) => {
          console.error("[Aero+] Humidity read error:", error)
        })
      }

      // Also try the full sensorData object (alternative structure)
      const sensorRef = getSensorDataRef()
      let unsubSensor = () => {}
      if (sensorRef) {
        unsubSensor = onValue(sensorRef, (snapshot) => {
          const data = snapshot.val()
          console.log("[Aero+] Full sensorData from Firebase:", data)
          if (data && typeof data === 'object') {
            firebaseConnected = true
            clearTimeout(connectionTimeout)
            setIsDemo(false)
            // Support both field naming conventions
            setCurrentData({
              gasPPM: data.gasPPM ?? data.gas ?? 0,
              temperature: data.temperature ?? data.temp ?? 0,
              humidity: data.humidity ?? 0,
              timestamp: data.timestamp ?? Date.now(),
            })
            setDeviceStatus(prev => ({ ...prev, isOnline: true, lastSeen: Date.now() }))
          }
          setConnectionAttempted(true)
        }, (error) => {
          console.error("[Aero+] SensorData read error:", error)
        })
      }

      // Listen to device status
      const deviceRef = getDeviceStatusRef()
      let unsubDevice = () => {}
      if (deviceRef) {
        unsubDevice = onValue(deviceRef, (snapshot) => {
          const status = snapshot.val()
          if (status) {
            setDeviceStatus(status)
          }
        }, (error) => {
          console.error("[Aero+] Device status error:", error)
        })
      }

      // Listen to alerts
      const alertRef = getAlertsRef()
      let unsubAlerts = () => {}
      if (alertRef) {
        unsubAlerts = onValue(alertRef, (snapshot) => {
          const data = snapshot.val()
          if (data) {
            const alertsList = Object.entries(data).map(([id, alert]: [string, unknown]) => ({
              id,
              ...(alert as Omit<Alert, 'id'>),
            })).sort((a, b) => b.timestamp - a.timestamp)
            setAlerts(alertsList)
          }
        }, (error) => {
          console.error("[Aero+] Alerts error:", error)
        })
      }

      // Listen to history
      const histRef = getSensorHistoryRef()
      let unsubHistory = () => {}
      if (histRef) {
        unsubHistory = onValue(histRef, (snapshot) => {
          const data = snapshot.val()
          if (data) {
            const historyList = Object.values(data) as SensorData[]
            setHistory(historyList.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)))
          }
        }, (error) => {
          console.error("[Aero+] History error:", error)
        })
      }

      return () => {
        clearTimeout(connectionTimeout)
        unsubGas()
        unsubTemp()
        unsubHumid()
        unsubSensor()
        unsubDevice()
        unsubAlerts()
        unsubHistory()
      }
    }, 100)

    return () => clearTimeout(initTimeout)
  }, [])

  // Demo mode simulation - only runs when in demo mode
  useEffect(() => {
    if (!isDemo || !connectionAttempted) return

    console.log("[Aero+] Running in demo mode")
    
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
      if (newData.gasPPM > 600) {
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
    ? calculateAQI(currentData.gasPPM, currentData.temperature, currentData.humidity)
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
