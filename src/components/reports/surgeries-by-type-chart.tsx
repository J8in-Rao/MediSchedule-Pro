"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import { surgeryByTpeData } from "@/lib/data"
import { ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  surgeries: {
    label: "Surgeries",
  },
  Cardiology: {
    label: "Cardiology",
    color: "hsl(var(--chart-1))",
  },
  Neurology: {
    label: "Neurology",
    color: "hsl(var(--chart-2))",
  },
  Orthopedics: {
    label: "Orthopedics",
    color: "hsl(var(--chart-3))",
  },
  General: {
    label: "General",
    color: "hsl(var(--chart-4))",
  },
  Other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export default function SurgeriesByTypeChart() {
  const totalSurgeries = React.useMemo(() => {
    return surgeryByTpeData.reduce((acc, curr) => acc + curr.count, 0)
  }, [])

  return (
    <div className="h-[350px] w-full">
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-full"
        >
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={surgeryByTpeData}
                    dataKey="count"
                    nameKey="type"
                    innerRadius={60}
                    strokeWidth={5}
                >
                    {surgeryByTpeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                <ChartLegend
                    content={<ChartLegendContent nameKey="type" />}
                    className="-translate-y-[2rem] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
            </PieChart>
        </ChartContainer>
    </div>
  )
}
