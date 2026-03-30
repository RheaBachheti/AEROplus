"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useUser, indianLocations, healthConditions } from "@/lib/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function Onboarding() {
  const { setUser, setIsOnboarded } = useUser()
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [disease, setDisease] = useState("")
  const [location, setLocation] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !age || !disease || !location) return

    setUser({
      name,
      age: parseInt(age),
      disease,
      location,
      daysActive: 0,
      createdAt: Date.now(),
    })
    setIsOnboarded(true)
  }

  const handleSkip = () => {
    setUser({
      name: "Guest",
      age: 30,
      disease: "None",
      location: "Delhi",
      daysActive: 0,
      createdAt: Date.now(),
    })
    setIsOnboarded(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Orange radial glow background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(249, 115, 22, 0.15) 0%, transparent 70%)",
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-secondary">AERO</span>
            <span className="text-primary">+</span>
          </h1>
          <p className="text-muted-foreground mt-2">Welcome to your Smart Environmental Hub</p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6 shadow-2xl"
          style={{
            boxShadow: "0 0 60px rgba(249, 115, 22, 0.1)",
          }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-6">Create Your Profile</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
              />
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age" className="text-foreground">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
              />
            </div>

            {/* Disease/Health Condition */}
            <div className="space-y-2">
              <Label htmlFor="disease" className="text-foreground">Health Condition</Label>
              <Select value={disease} onValueChange={setDisease}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {healthConditions.map((condition) => (
                    <SelectItem key={condition} value={condition} className="text-foreground">
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-foreground">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select state/UT" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {indianLocations.map((loc) => (
                    <SelectItem key={loc} value={loc} className="text-foreground">
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 text-base"
                disabled={!name || !age || !disease || !location}
              >
                Continue
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="border-accent text-accent hover:bg-accent/10 hover:text-accent font-medium h-12"
              >
                Skip
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Bottom text */}
        <p className="text-center text-muted-foreground text-sm mt-6">
          Your data helps us personalize air quality recommendations
        </p>
      </motion.div>
    </div>
  )
}
