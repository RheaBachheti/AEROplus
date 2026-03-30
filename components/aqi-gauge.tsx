"use client"

import { motion } from "framer-motion"
import { getAQICategory } from "@/lib/firebase"

interface AQIGaugeProps {
  value: number
  label: string
  subtitle?: string
  size?: "sm" | "md" | "lg"
}

export function AQIGauge({ value, label, subtitle, size = "md" }: AQIGaugeProps) {
  const category = getAQICategory(value)
  
  // Calculate the stroke dash for the arc (0-500 AQI scale)
  const percentage = Math.min(value / 500, 1)
  const circumference = 2 * Math.PI * 80 // radius = 80
  const strokeDashoffset = circumference * (1 - percentage * 0.75) // 270 degree arc (0.75)
  
  const sizes = {
    sm: { width: 140, height: 140, fontSize: "text-2xl", labelSize: "text-xs" },
    md: { width: 180, height: 180, fontSize: "text-4xl", labelSize: "text-sm" },
    lg: { width: 220, height: 220, fontSize: "text-5xl", labelSize: "text-base" },
  }
  
  const { width, height, fontSize, labelSize } = sizes[size]

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height }}>
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full -rotate-135"
        >
          {/* Background arc */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            className="text-muted"
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
          />
          
          {/* Colored arc */}
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={category.color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 10px ${category.color}40)`,
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`${fontSize} font-bold`}
            style={{ color: category.color }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {value}
          </motion.span>
          <span className={`${labelSize} text-muted-foreground font-medium`}>AQI</span>
        </div>
      </div>
      
      {/* Label below gauge */}
      <div className="text-center mt-2">
        <h3 className="text-foreground font-semibold text-lg">{label}</h3>
        {subtitle && (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        )}
        <motion.span
          className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium`}
          style={{ 
            backgroundColor: `${category.color}20`,
            color: category.color,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {category.label}
        </motion.span>
      </div>
    </div>
  )
}
