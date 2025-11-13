"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ChartConfig } from "@/components/ui/chart"
import type { OperationSchedule } from "@/lib/types";
import { useMemo } from "react";

/**
 * A client component that renders a bar chart for OT Utilization.
 * 
 * This chart visualizes how many surgeries have been performed in each operating theater.
 * It receives the raw surgery data and processes it into a format suitable for the chart.
 */

// A predefined list of colors for the chart bars to ensure a consistent look.
const chartColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

type OtUtilizationChartProps = {
  surgeries: OperationSchedule[];
}

export default function OtUtilizationChart({ surgeries }: OtUtilizationChartProps) {
  // The data processing logic is memoized with useMemo. This is a performance optimization
  // to ensure that the heavy computation of summarizing data only runs when the `surgeries` prop actually changes.
  const { data, config } = useMemo(() => {
    // We reduce the surgeries array into an object that counts surgeries per OT room.
    const utilization = surgeries.reduce((acc, surgery) => {
      // Note: We need to fetch OT room numbers in the parent for a better label.
      const roomKey = `OT ${surgery.ot_id}`;
      acc[roomKey] = (acc[roomKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // The charting library expects an array of objects, so we format it here.
    const chartData = [{ name: 'Total Surgeries', ...utilization }];

    // This dynamically creates a configuration object for the chart,
    // assigning a label and a color to each OT room.
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
          {/* We loop through the generated config to render a <Bar> for each OT room. */}
          {Object.keys(config).map((key) => (
             <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={4} />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  )
}
