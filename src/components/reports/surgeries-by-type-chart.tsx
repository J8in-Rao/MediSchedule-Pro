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
import { ChartConfig } from "@/components/ui/chart"
import type { OperationSchedule, Doctor } from "@/lib/types"

/**
 * A client component that renders a Pie Chart for surgeries grouped by type (specialization).
 * 
 * This chart is useful for understanding the distribution of different kinds of surgeries.
 * It requires both surgery and doctor data to link a surgery to a doctor's specialization.
 */

// A mapping of specializations to specific chart colors for consistency.
const chartColors = {
  Cardiology: "hsl(var(--chart-1))",
  Neurology: "hsl(var(--chart-2))",
  Orthopedics: "hsl(var(--chart-3))",
  "General Surgery": "hsl(var(--chart-4))",
  Other: "hsl(var(--chart-5))",
} as const;

type Specialization = keyof typeof chartColors;

type SurgeriesByTypeChartProps = {
  surgeries: OperationSchedule[];
  doctors: Doctor[];
}

export default function SurgeriesByTypeChart({ surgeries, doctors }: SurgeriesByTypeChartProps) {
  // Data processing is memoized to avoid re-calculation on every render.
  const { data, config } = React.useMemo(() => {
    // A Map is used for efficient lookup of a doctor's specialization by their ID.
    const doctorMap = new Map(doctors.map(doc => [doc.id, doc.specialization]));

    // We reduce the surgeries array to count surgeries per specialization.
    const surgeriesBySpecialization = surgeries.reduce((acc, surgery) => {
      const specialization = doctorMap.get(surgery.doctor_id) || 'Other';
      const specKey: Specialization = Object.keys(chartColors).includes(specialization) ? specialization as Specialization : 'Other';
      acc[specKey] = (acc[specKey] || 0) + 1;
      return acc;
    }, {} as Record<Specialization, number>);

    // The data is then formatted into the structure required by the charting library.
    const chartData = Object.entries(surgeriesBySpecialization).map(([type, count]) => ({
      type: type as Specialization,
      count,
      fill: chartColors[type as Specialization],
    }));

    // A config object is created to define labels and colors for the chart's legend and tooltips.
    const chartConfig: ChartConfig = Object.keys(chartColors).reduce((acc, key) => {
      acc[key] = {
        label: key,
        color: chartColors[key as Specialization],
      };
      return acc;
    }, {
      surgeries: { label: "Surgeries" }
    } as ChartConfig);

    return { data: chartData, config: chartConfig };
  }, [surgeries, doctors]);

  if (!surgeries || surgeries.length === 0) {
    return <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">No data available to display.</div>;
  }

  return (
    <div className="h-[350px] w-full">
        <ChartContainer
            config={config}
            className="mx-auto aspect-square h-full"
        >
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={data}
                    dataKey="count"
                    nameKey="type"
                    innerRadius={60}
                    strokeWidth={5}
                >
                    {/* Each segment of the pie chart is rendered here with its specific color. */}
                    {data.map((entry, index) => (
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
