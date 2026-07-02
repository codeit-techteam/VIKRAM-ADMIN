"use client";

import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartDataPoint } from "@/components/charts/bar-chart";
import { cn } from "@/lib/utils";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface PieChartCardProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  dataKey?: string;
  nameKey?: string;
  className?: string;
  height?: number;
  innerRadius?: number;
}

export function PieChartCard({
  title,
  description,
  data,
  dataKey = "value",
  nameKey = "label",
  className,
  height = 300,
  innerRadius = 0,
}: PieChartCardProps) {
  const isDonut = innerRadius > 0;

  return (
    <Card className={cn("shadow-card rounded-xl", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={isDonut ? 80 : 100}
              paddingAngle={2}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DonutChartCard(props: Omit<PieChartCardProps, "innerRadius">) {
  return <PieChartCard {...props} innerRadius={60} />;
}
