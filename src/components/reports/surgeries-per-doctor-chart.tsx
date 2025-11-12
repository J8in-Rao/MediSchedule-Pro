"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ChartConfig } from "@/components/ui/chart"
import type { OperationSchedule } from "@/lib/types";
import { useMemo } from "react";

const chartConfig = {
  surgeries: {
    label: "Surgeries",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type SurgeriesPerDoctorChartProps = {
  surgeries: OperationSchedule[];
}

export default function SurgeriesPerDoctorChart({ surgeries }: SurgeriesPerDoctorChartProps) {
  const data = useMemo(() => {
    const surgeriesByDoctor = surgeries.reduce((acc, surgery) => {
      const doctorName = surgery.doctorName;
      acc[doctorName] = (acc[doctorName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(surgeriesByDoctor).map(([name, count]) => ({
      doctor: name,
      surgeries: count,
    }));
  }, [surgeries]);

  if (!surgeries || surgeries.length === 0) {
    return <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">No data available to display.</div>;
  }

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <BarChart data={data} accessibilityLayer margin={{ left: 20 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="doctor"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            allowDecimals={false}
          />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="surgeries" fill="var(--color-surgeries)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
