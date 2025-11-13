"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ChartConfig } from "@/components/ui/chart"
import type { OperationSchedule, Doctor } from "@/lib/types";
import { useMemo } from "react";

/**
 * A client component that renders a bar chart showing the number of surgeries per doctor.
 * 
 * This provides a clear view of workload distribution among the medical staff.
 * It processes the raw surgery data, which should ideally include doctor names.
 */

const chartColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const chartConfig = {
  surgeries: {
    label: "Surgeries",
  },
} satisfies ChartConfig

type SurgeriesPerDoctorChartProps = {
  surgeries: OperationSchedule[];
  doctors: Doctor[];
}

export default function SurgeriesPerDoctorChart({ surgeries, doctors }: SurgeriesPerDoctorChartProps) {
  // Memoizing the data processing is important for performance.
  const data = useMemo(() => {
    const doctorMap = new Map(doctors.map(d => [d.id, d.name]));

    // We group surgeries by doctor name and count them.
    const surgeriesByDoctor = surgeries.reduce((acc, surgery) => {
      const doctorName = doctorMap.get(surgery.doctor_id) || surgery.doctor_id;
      acc[doctorName] = (acc[doctorName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Format the aggregated data into an array for the chart.
    return Object.entries(surgeriesByDoctor).map(([name, count], index) => ({
      doctor: name,
      surgeries: count,
      fill: chartColors[index % chartColors.length]
    }));
  }, [surgeries, doctors]);

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
          <Bar dataKey="surgeries" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
