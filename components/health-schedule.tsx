"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { type UserProfile } from "@/lib/user-context"
import { 
  Sun, 
  Moon, 
  Utensils, 
  Footprints, 
  Wind,
  AlertCircle,
  CheckCircle,
  Clock,
  Heart
} from "lucide-react"

interface HealthScheduleProps {
  indoorAQI: number
  outdoorAQI: number
  user: UserProfile | null
}

interface ScheduleItem {
  id: string
  time: string
  activity: string
  icon: React.ReactNode
  recommendation: string
  status: "safe" | "caution" | "avoid"
  reason: string
}

export function HealthSchedule({ indoorAQI, outdoorAQI, user }: HealthScheduleProps) {
  // Generate personalized schedule based on user health condition and AQI
  const schedule = useMemo(() => {
    const items: ScheduleItem[] = []
    const hasRespiratoryCondition = user?.disease && 
      ["Asthma", "COPD", "Bronchitis", "Allergies", "Sinusitis", "Pneumonia History", "Other Respiratory"].includes(user.disease)
    
    // Sensitivity multiplier for people with respiratory conditions
    const sensitivityFactor = hasRespiratoryCondition ? 0.7 : 1
    
    // Morning walk assessment (6-8 AM typically has better air quality)
    const morningWalkSafe = outdoorAQI < (100 * sensitivityFactor)
    items.push({
      id: "morning-walk",
      time: "6:00 AM - 8:00 AM",
      activity: "Morning Walk",
      icon: <Footprints className="w-5 h-5" />,
      recommendation: morningWalkSafe ? "Great time for outdoor activity" : "Consider indoor exercise today",
      status: morningWalkSafe ? "safe" : outdoorAQI < 150 ? "caution" : "avoid",
      reason: `Outdoor AQI: ${outdoorAQI}${hasRespiratoryCondition ? " (sensitive)" : ""}`,
    })
    
    // Morning cooking (breakfast)
    const morningCookSafe = indoorAQI < (80 * sensitivityFactor)
    items.push({
      id: "breakfast-cooking",
      time: "7:30 AM - 9:00 AM",
      activity: "Breakfast Cooking",
      icon: <Utensils className="w-5 h-5" />,
      recommendation: morningCookSafe ? "Safe to cook with normal ventilation" : "Use exhaust fan while cooking",
      status: morningCookSafe ? "safe" : indoorAQI < 120 ? "caution" : "avoid",
      reason: `Indoor AQI: ${indoorAQI}`,
    })
    
    // Midday activities
    const middaySafe = outdoorAQI < (120 * sensitivityFactor)
    items.push({
      id: "midday-outdoor",
      time: "11:00 AM - 2:00 PM",
      activity: "Outdoor Errands",
      icon: <Sun className="w-5 h-5" />,
      recommendation: middaySafe ? "Good time for short outdoor trips" : "Limit outdoor exposure",
      status: middaySafe ? "safe" : outdoorAQI < 180 ? "caution" : "avoid",
      reason: `Peak sun hours, AQI: ${outdoorAQI}`,
    })
    
    // Afternoon rest period
    items.push({
      id: "afternoon-rest",
      time: "2:00 PM - 4:00 PM",
      activity: "Indoor Rest",
      icon: <Heart className="w-5 h-5" />,
      recommendation: "Best time for indoor activities and rest",
      status: "safe",
      reason: "Hottest part of day, stay hydrated",
    })
    
    // Evening walk assessment
    const eveningWalkSafe = outdoorAQI < (100 * sensitivityFactor)
    items.push({
      id: "evening-walk",
      time: "5:00 PM - 7:00 PM",
      activity: "Evening Walk",
      icon: <Footprints className="w-5 h-5" />,
      recommendation: eveningWalkSafe ? "Pleasant time for outdoor walk" : "Better to exercise indoors",
      status: eveningWalkSafe ? "safe" : outdoorAQI < 150 ? "caution" : "avoid",
      reason: `Cooler temperatures, AQI: ${outdoorAQI}`,
    })
    
    // Dinner cooking
    const dinnerCookSafe = indoorAQI < (80 * sensitivityFactor)
    items.push({
      id: "dinner-cooking",
      time: "7:00 PM - 9:00 PM",
      activity: "Dinner Cooking",
      icon: <Utensils className="w-5 h-5" />,
      recommendation: dinnerCookSafe ? "Normal cooking is fine" : "Open windows or use chimney",
      status: dinnerCookSafe ? "safe" : indoorAQI < 120 ? "caution" : "avoid",
      reason: `Indoor AQI: ${indoorAQI}`,
    })
    
    // Night ventilation
    const nightVentilationSafe = outdoorAQI < indoorAQI
    items.push({
      id: "night-ventilation",
      time: "9:00 PM - 6:00 AM",
      activity: "Night Ventilation",
      icon: <Moon className="w-5 h-5" />,
      recommendation: nightVentilationSafe ? "Open windows for fresh air" : "Keep windows closed",
      status: nightVentilationSafe ? "safe" : "caution",
      reason: nightVentilationSafe ? "Outdoor air is fresher" : "Indoor air is cleaner",
    })

    return items
  }, [indoorAQI, outdoorAQI, user])

  // Calculate overall health score
  const healthScore = useMemo(() => {
    const safeCount = schedule.filter(s => s.status === "safe").length
    return Math.round((safeCount / schedule.length) * 100)
  }, [schedule])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Monthly Schedule</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Personalized recommendations based on your health profile
        </p>
      </div>

      {/* User Health Profile Card */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-foreground font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">
                {user.age} years old • {user.disease}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{healthScore}%</div>
              <p className="text-xs text-muted-foreground">Day Score</p>
            </div>
          </div>
          
          {/* Health tip based on condition */}
          {user.disease !== "None" && (
            <div className="mt-3 p-3 bg-accent/10 rounded-lg">
              <p className="text-xs text-accent flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  With {user.disease}, we recommend extra caution when AQI exceeds 100.
                </span>
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Current Conditions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Wind className="w-6 h-6 mx-auto text-primary mb-2" />
          <div className="text-2xl font-bold text-foreground">{indoorAQI}</div>
          <p className="text-xs text-muted-foreground">Indoor AQI</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Sun className="w-6 h-6 mx-auto text-secondary mb-2" />
          <div className="text-2xl font-bold text-foreground">{outdoorAQI}</div>
          <p className="text-xs text-muted-foreground">Outdoor AQI</p>
        </div>
      </motion.div>

      {/* Schedule Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h3 className="text-foreground font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          {"Today's Schedule"}
        </h3>
        
        {schedule.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className={`bg-card border rounded-xl p-4 ${
              item.status === "safe" 
                ? "border-green-500/30" 
                : item.status === "caution" 
                  ? "border-yellow-500/30" 
                  : "border-destructive/30"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Status indicator */}
              <div className={`p-2 rounded-lg ${
                item.status === "safe" 
                  ? "bg-green-500/20 text-green-500" 
                  : item.status === "caution" 
                    ? "bg-yellow-500/20 text-yellow-500" 
                    : "bg-destructive/20 text-destructive"
              }`}>
                {item.icon}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-foreground font-medium">{item.activity}</h4>
                  {item.status === "safe" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : item.status === "caution" ? (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                <p className="text-sm text-foreground/80 mt-2">{item.recommendation}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center px-4">
        Recommendations are based on current air quality readings. 
        Always consult your healthcare provider for medical advice.
      </p>
    </div>
  )
}
