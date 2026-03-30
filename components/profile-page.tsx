"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useUser, indianLocations, healthConditions } from "@/lib/user-context"
import { type DeviceStatus } from "@/lib/firebase"
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
import {
  User,
  MapPin,
  Heart,
  Calendar,
  Wifi,
  WifiOff,
  Edit2,
  Save,
  X,
  LogOut,
  Activity,
} from "lucide-react"
import { toast } from "sonner"

interface ProfilePageProps {
  deviceStatus: DeviceStatus
}

export function ProfilePage({ deviceStatus }: ProfilePageProps) {
  const { user, setUser, setIsOnboarded, setShowSplash } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    age: user?.age?.toString() || "",
    disease: user?.disease || "",
    location: user?.location || "",
  })

  const handleSave = () => {
    if (!editForm.name || !editForm.age || !editForm.disease || !editForm.location) {
      toast.error("Please fill in all fields")
      return
    }

    setUser({
      ...user!,
      name: editForm.name,
      age: parseInt(editForm.age),
      disease: editForm.disease,
      location: editForm.location,
    })
    setIsEditing(false)
    toast.success("Profile updated successfully")
  }

  const handleCancel = () => {
    setEditForm({
      name: user?.name || "",
      age: user?.age?.toString() || "",
      disease: user?.disease || "",
      location: user?.location || "",
    })
    setIsEditing(false)
  }

  const handleLogout = () => {
    setUser(null)
    setIsOnboarded(false)
    setShowSplash(true)
    toast.success("Logged out successfully")
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Profile</h2>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        {/* Profile header with glow */}
        <div 
          className="relative h-24"
          style={{
            background: "linear-gradient(135deg, rgba(249, 115, 22, 0.3) 0%, rgba(56, 189, 248, 0.2) 100%)",
          }}
        >
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className="w-20 h-20 rounded-full bg-card border-4 border-background flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>

        {/* Profile content */}
        <div className="pt-14 px-6 pb-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-age">Age</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                  className="bg-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-disease">Health Condition</Label>
                <Select 
                  value={editForm.disease} 
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, disease: value }))}
                >
                  <SelectTrigger className="bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card max-h-60">
                    {healthConditions.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Select 
                  value={editForm.location} 
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, location: value }))}
                >
                  <SelectTrigger className="bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card max-h-60">
                    {indianLocations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-foreground text-center">{user.name}</h3>
              <p className="text-muted-foreground text-center text-sm mt-1">
                {user.location}
              </p>

              {/* Profile stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <ProfileStat 
                  icon={<Calendar className="w-5 h-5" />}
                  label="Age"
                  value={`${user.age} yrs`}
                />
                <ProfileStat 
                  icon={<Heart className="w-5 h-5" />}
                  label="Health"
                  value={user.disease}
                />
                <ProfileStat 
                  icon={<Activity className="w-5 h-5" />}
                  label="Active"
                  value={`${user.daysActive} days`}
                />
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Device Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-4"
      >
        <h3 className="text-foreground font-semibold mb-3 flex items-center gap-2">
          {deviceStatus.isOnline ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-muted-foreground" />
          )}
          Device Connection
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className={deviceStatus.isOnline ? "text-green-500" : "text-muted-foreground"}>
              {deviceStatus.isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Seen</span>
            <span className="text-foreground">
              {new Date(deviceStatus.lastSeen).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Buzzer</span>
            <span className={deviceStatus.buzzerActive ? "text-destructive" : "text-muted-foreground"}>
              {deviceStatus.buzzerActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Days Active Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl p-4"
      >
        <h3 className="text-foreground font-semibold mb-3">Monitoring History</h3>
        
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(56, 189, 248, 0.2) 100%)",
            }}
          >
            <span className="text-2xl font-bold text-primary">{user.daysActive}</span>
          </div>
          <div>
            <p className="text-foreground font-medium">Days Active</p>
            <p className="text-sm text-muted-foreground">
              Since {new Date(user.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          variant="outline"
          className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </motion.div>

      {/* Firebase Setup Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center space-y-2 pb-8"
      >
        <p className="text-xs text-muted-foreground">
          Connect your ESP32 device by setting up Firebase
        </p>
        <p className="text-xs text-muted-foreground/60">
          Add NEXT_PUBLIC_FIREBASE_DATABASE_URL to your environment
        </p>
      </motion.div>
    </div>
  )
}

interface ProfileStatProps {
  icon: React.ReactNode
  label: string
  value: string
}

function ProfileStat({ icon, label, value }: ProfileStatProps) {
  return (
    <div className="text-center p-3 bg-muted/30 rounded-lg">
      <span className="text-primary block mb-1">{icon}</span>
      <span className="text-xs text-muted-foreground block">{label}</span>
      <span className="text-sm font-medium text-foreground block truncate">{value}</span>
    </div>
  )
}
