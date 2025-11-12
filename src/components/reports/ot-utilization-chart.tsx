"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { otUtilizationData } from "@/lib/data"
import { ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  "OT 1": {
    label: "OT 1",
    color: "hsl(var(--chart-1))",
  },
  "OT 2": {
    label: "OT 2",
    color: "hsl(var(--chart-2))",
  },
  "OT 3": {
    label: "OT 3",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export default function OtUtilizationChart() {
  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <BarChart data={otUtilizationData} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis 
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="OT 1" fill="var(--color-OT 1)" radius={4} />
          <Bar dataKey="OT 2" fill="var(--color-OT 2)" radius={4} />
          <Bar dataKey="OT 3" fill="var(--color-OT 3)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
