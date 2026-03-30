"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "@/lib/user-context"
import { useSensorData } from "@/hooks/use-sensor-data"
import { BottomNav } from "@/components/bottom-nav"
import { AQIGauge } from "@/components/aqi-gauge"
import { TrendChart } from "@/components/trend-chart"
import { AlertBanner } from "@/components/alert-banner"
import { DeviceStatusCard } from "@/components/device-status"
import { HealthSchedule } from "@/components/health-schedule"
import { ProfilePage } from "@/components/profile-page"
import { Bell, MapPin } from "lucide-react"

type TabType = "home" | "schedule" | "profile"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("home")
  const [dismissedAlert, setDismissedAlert] = useState(false)
  const { user } = useUser()
  const { currentData, deviceStatus, alerts, history, indoorAQI, getOutdoorAQI, isDemo } = useSensorData()

  const outdoorAQI = user ? getOutdoorAQI(user.location) : 100
  const latestAlert = !dismissedAlert && alerts.length > 0 ? alerts[0] : null

  const handleDismissAlert = useCallback(() => {
    setDismissedAlert(true)
    // Reset after 30 seconds to allow new alerts
    setTimeout(() => setDismissedAlert(false), 30000)
  }, [])

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Alert Banner */}
      <AlertBanner
        alert={latestAlert}
        buzzerActive={deviceStatus.buzzerActive}
        onDismiss={handleDismissAlert}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-secondary">AERO</span>
              <span className="text-primary">+</span>
            </h1>
            {user && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{user.location}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {isDemo && (
              <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">
                Demo Mode
              </span>
            )}
            <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-foreground" />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "home" && (
          <motion.main
            key="home"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="px-4 py-6 max-w-4xl mx-auto"
          >
            {/* Welcome message */}
            {user && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Hello, {user.name.split(" ")[0]}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {"Here's your air quality overview"}
                </p>
              </div>
            )}

            {/* AQI Gauges */}
            <section className="mb-8">
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center justify-center"
                  style={{
                    boxShadow: "0 0 40px rgba(249, 115, 22, 0.08)",
                  }}
                >
                  <AQIGauge
                    value={indoorAQI}
                    label="Indoor AQI"
                    subtitle="From ESP32"
                    size="md"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center justify-center"
                  style={{
                    boxShadow: "0 0 40px rgba(56, 189, 248, 0.08)",
                  }}
                >
                  <AQIGauge
                    value={outdoorAQI}
                    label="Outdoor AQI"
                    subtitle={user?.location || "Location"}
                    size="md"
                  />
                </motion.div>
              </div>
            </section>

            {/* Device Status */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <DeviceStatusCard
                sensorData={currentData}
                deviceStatus={deviceStatus}
              />
            </motion.section>

            {/* 24-Hour Trend Chart */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <h3 className="text-foreground font-semibold mb-4">
                24-Hour Pollutant Trends
              </h3>
              <TrendChart data={history} />
            </motion.section>

            {/* Quick insights */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 grid grid-cols-2 gap-3"
            >
              <InsightCard
                title="Best Time to Walk"
                value={indoorAQI > outdoorAQI ? "Now (Outdoors)" : "Stay Inside"}
                description={indoorAQI > outdoorAQI ? "Outdoor air is better" : "Indoor air is safer"}
                accent="secondary"
              />
              <InsightCard
                title="Cooking Advisory"
                value={indoorAQI < 100 ? "Safe to Cook" : "Use Ventilation"}
                description={indoorAQI < 100 ? "Air quality is good" : "Turn on exhaust fan"}
                accent="primary"
              />
            </motion.section>
          </motion.main>
        )}

        {activeTab === "schedule" && (
          <motion.main
            key="schedule"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="px-4 py-6 max-w-4xl mx-auto"
          >
            <HealthSchedule
              indoorAQI={indoorAQI}
              outdoorAQI={outdoorAQI}
              user={user}
            />
          </motion.main>
        )}

        {activeTab === "profile" && (
          <motion.main
            key="profile"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="px-4 py-6 max-w-4xl mx-auto"
          >
            <ProfilePage deviceStatus={deviceStatus} />
          </motion.main>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

interface InsightCardProps {
  title: string
  value: string
  description: string
  accent: "primary" | "secondary"
}

function InsightCard({ title, value, description, accent }: InsightCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h4 className="text-xs text-muted-foreground uppercase tracking-wide">{title}</h4>
      <p className={`text-lg font-bold mt-1 ${accent === "primary" ? "text-primary" : "text-secondary"}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  )
}
