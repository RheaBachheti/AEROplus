"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Volume2, X, Wind } from "lucide-react"
import { type Alert } from "@/lib/firebase"

interface AlertBannerProps {
  alert: Alert | null
  buzzerActive: boolean
  onDismiss?: () => void
}

export function AlertBanner({ alert, buzzerActive, onDismiss }: AlertBannerProps) {
  if (!alert && !buzzerActive) return null

  return (
    <AnimatePresence>
      {(alert || buzzerActive) && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div 
            className="relative overflow-hidden rounded-xl border border-destructive/30 p-4"
            style={{
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)",
              boxShadow: "0 0 30px rgba(239, 68, 68, 0.2)",
            }}
          >
            {/* Pulsing background effect */}
            <motion.div
              className="absolute inset-0 bg-destructive/10"
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            
            <div className="relative flex items-start gap-3">
              {/* Alert icon */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="flex-shrink-0"
              >
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </motion.div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-destructive font-bold text-sm">
                  {alert?.message || "HIGH GAS DETECTED"}
                </h4>
                <p className="text-destructive/80 text-xs mt-1">
                  Open windows or turn on ventilation immediately
                </p>
                
                {/* Hardware status indicators */}
                <div className="flex items-center gap-3 mt-2">
                  {buzzerActive && (
                    <motion.div
                      className="flex items-center gap-1.5 text-xs"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-destructive" />
                      <span className="text-destructive font-medium">Buzzer Active</span>
                    </motion.div>
                  )}
                  
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Wind className="w-3.5 h-3.5" />
                    <span>Ventilate Now</span>
                  </div>
                </div>
              </div>
              
              {/* Dismiss button */}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-destructive/20 transition-colors"
                >
                  <X className="w-4 h-4 text-destructive/60" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
