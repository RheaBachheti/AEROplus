"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"bird" | "text" | "zoom" | "done">("bird")

  useEffect(() => {
    // Phase timing
    const birdTimer = setTimeout(() => setPhase("text"), 1200)
    const textTimer = setTimeout(() => setPhase("zoom"), 2200)
    const zoomTimer = setTimeout(() => {
      setPhase("done")
      onComplete()
    }, 3000)

    return () => {
      clearTimeout(birdTimer)
      clearTimeout(textTimer)
      clearTimeout(zoomTimer)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: "#06b6d4" }} // Cyan background
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Dotted trail that forms AERO+ */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "text" || phase === "zoom" ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Sky blue dotted trail effect */}
            <svg className="absolute w-full h-full" viewBox="0 0 800 200">
              <motion.path
                d="M 50 100 Q 200 50 400 100 Q 600 150 750 100"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeDasharray="8 12"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
          </motion.div>

          {/* Cinnamon Canary Bird */}
          <motion.div
            className="absolute"
            initial={{ x: "-100vw", y: 0 }}
            animate={{
              x: phase === "bird" ? "0vw" : "100vw",
              y: phase === "bird" ? [0, -30, 0, -20, 0] : 0,
            }}
            transition={{
              x: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] },
              y: { duration: 1.2, times: [0, 0.25, 0.5, 0.75, 1] },
            }}
          >
            <svg
              width="120"
              height="80"
              viewBox="0 0 120 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Bird body - Cinnamon/warm orange color */}
              <motion.ellipse
                cx="50"
                cy="40"
                rx="30"
                ry="20"
                fill="#D2691E"
                animate={{ scaleX: [1, 1.05, 1], scaleY: [1, 0.95, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
              {/* Bird head */}
              <circle cx="75" cy="35" r="15" fill="#CD853F" />
              {/* Eye */}
              <circle cx="80" cy="33" r="3" fill="#1a1a1a" />
              <circle cx="81" cy="32" r="1" fill="white" />
              {/* Beak */}
              <polygon points="90,35 100,37 90,39" fill="#f97316" />
              {/* Wing */}
              <motion.ellipse
                cx="45"
                cy="38"
                rx="18"
                ry="12"
                fill="#8B4513"
                animate={{ rotate: [-5, 15, -5] }}
                transition={{ duration: 0.15, repeat: Infinity }}
                style={{ transformOrigin: "55px 38px" }}
              />
              {/* Tail feathers */}
              <motion.path
                d="M 20 40 Q 5 30 10 45 Q 5 50 20 45"
                fill="#A0522D"
                animate={{ rotate: [-3, 3, -3] }}
                transition={{ duration: 0.2, repeat: Infinity }}
                style={{ transformOrigin: "25px 42px" }}
              />
              {/* Belly highlight */}
              <ellipse cx="55" cy="48" rx="15" ry="8" fill="#DEB887" opacity="0.7" />
            </svg>
          </motion.div>

          {/* AERO+ Text */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: phase === "text" || phase === "zoom" ? 1 : 0,
              scale: phase === "zoom" ? 3 : 1,
            }}
            transition={{
              opacity: { duration: 0.3 },
              scale: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
            }}
          >
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
              <span className="text-sky-blue" style={{ color: "#38bdf8" }}>AERO</span>
              <span className="text-primary" style={{ color: "#f97316" }}>+</span>
            </h1>
            <motion.p
              className="text-center text-white/80 text-lg mt-2 font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: phase === "text" ? 1 : 0, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Smart Environmental Hub
            </motion.p>
          </motion.div>

          {/* Whoosh effect lines */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "bird" ? 1 : 0 }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-0.5 bg-white/30 rounded-full"
                style={{
                  top: `${40 + i * 5}%`,
                  width: "60px",
                }}
                initial={{ x: "-100px", opacity: 0 }}
                animate={{
                  x: ["0vw", "30vw"],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.05,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
