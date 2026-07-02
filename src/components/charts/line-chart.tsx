"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
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

interface LineChartCardProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  className?: string;
  height?: number;
}

export function LineChartCard({
  title,
  description,
  data,
  dataKey = "value",
  xAxisKey = "label",
  color = "hsl(var(--primary))",
  className,
  height = 300,
}: LineChartCardProps) {
  return (
    <Card className={cn("shadow-card rounded-xl", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={xAxisKey} className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
