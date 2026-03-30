"use client"

import { motion } from "framer-motion"
import { Wifi, WifiOff, Thermometer, Droplets, Wind, Volume2 } from "lucide-react"
import { type SensorData, type DeviceStatus } from "@/lib/firebase"

interface DeviceStatusCardProps {
  sensorData: SensorData | null
  deviceStatus: DeviceStatus
}

export function DeviceStatusCard({ sensorData, deviceStatus }: DeviceStatusCardProps) {
  const isOnline = deviceStatus.isOnline
  const lastSeen = new Date(deviceStatus.lastSeen).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground font-semibold">ESP32 Device</h3>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Wifi className="w-4 h-4 text-green-500" />
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <WifiOff className="w-4 h-4 text-muted-foreground" />
            </>
          )}
        </div>
      </div>

      {/* Sensor readings */}
      <div className="grid grid-cols-3 gap-3">
        <SensorReading
          icon={<Wind className="w-4 h-4" />}
          label="Gas"
          value={sensorData?.gas ?? "--"}
          unit="PPM"
          color="text-primary"
        />
        <SensorReading
          icon={<Thermometer className="w-4 h-4" />}
          label="Temp"
          value={sensorData?.temperature ?? "--"}
          unit="°C"
          color="text-secondary"
        />
        <SensorReading
          icon={<Droplets className="w-4 h-4" />}
          label="Humidity"
          value={sensorData?.humidity ?? "--"}
          unit="%"
          color="text-accent"
        />
      </div>

      {/* Hardware status */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">
          Last seen: {lastSeen}
        </span>
        
        {deviceStatus.buzzerActive && (
          <motion.div
            className="flex items-center gap-1.5 px-2 py-1 bg-destructive/20 rounded-full"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <Volume2 className="w-3 h-3 text-destructive" />
            <span className="text-xs text-destructive font-medium">Buzzer On</span>
          </motion.div>
        )}
      </div>
    </div>
  )
}

interface SensorReadingProps {
  icon: React.ReactNode
  label: string
  value: number | string
  unit: string
  color: string
}

function SensorReading({ icon, label, value, unit, color }: SensorReadingProps) {
  return (
    <div className="flex flex-col items-center p-2 bg-muted/30 rounded-lg">
      <span className={`${color} mb-1`}>{icon}</span>
      <span className="text-lg font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{unit}</span>
    </div>
  )
}
