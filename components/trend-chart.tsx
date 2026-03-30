"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { type SensorData, calculateAQI } from "@/lib/firebase"

interface TrendChartProps {
  data: SensorData[]
  showAQI?: boolean
}

export function TrendChart({ data, showAQI = true }: TrendChartProps) {
  // Transform data for the chart
  const chartData = data.map((item) => {
    const date = new Date(item.timestamp)
    return {
      time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      hour: date.getHours(),
      gas: item.gas,
      temperature: item.temperature,
      humidity: item.humidity,
      aqi: calculateAQI(item.gas, item.temperature, item.humidity),
    }
  })

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "10px" }}
            iconType="circle"
          />
          
          {showAQI && (
            <Line
              type="monotone"
              dataKey="aqi"
              name="AQI"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
            />
          )}
          
          <Line
            type="monotone"
            dataKey="gas"
            name="Gas (PPM)"
            stroke="hsl(var(--chart-4))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          
          <Line
            type="monotone"
            dataKey="temperature"
            name="Temp (°C)"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          
          <Line
            type="monotone"
            dataKey="humidity"
            name="Humidity (%)"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
