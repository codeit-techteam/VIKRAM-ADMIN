"use client";

import {
  Area,
  AreaChart,
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

interface AreaChartCardProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  className?: string;
  height?: number;
}

export function AreaChartCard({
  title,
  description,
  data,
  dataKey = "value",
  xAxisKey = "label",
  color = "hsl(var(--primary))",
  className,
  height = 300,
}: AreaChartCardProps) {
  return (
    <Card className={cn("shadow-card rounded-xl", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={xAxisKey} className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill="url(#colorValue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
