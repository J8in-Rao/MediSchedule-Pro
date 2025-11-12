"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ChartConfig } from "@/components/ui/chart"
import type { OperationSchedule } from "@/lib/types";
import { useMemo } from "react";

const chartColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

type OtUtilizationChartProps = {
  surgeries: OperationSchedule[];
}

export default function OtUtilizationChart({ surgeries }: OtUtilizationChartProps) {
  const { data, config } = useMemo(() => {
    const utilization = surgeries.reduce((acc, surgery) => {
      const roomKey = `OT ${surgery.otId}`;
      acc[roomKey] = (acc[roomKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData = [{ name: 'Total Surgeries', ...utilization }];

    const chartConfig: ChartConfig = Object.keys(utilization).reduce((acc, key, index) => {
      acc[key] = {
        label: key,
        color: chartColors[index % chartColors.length],
      };
      return acc;
    }, {} as ChartConfig);

    return { data: chartData, config: chartConfig };
  }, [surgeries]);


  if (!surgeries || surgeries.length === 0) {
    return <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">No data available to display.</div>;
  }

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={config} className="w-full h-full">
        <BarChart data={data} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis 
            allowDecimals={false}
          />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Legend />
          {Object.keys(config).map((key) => (
             <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={4} />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  )
}
