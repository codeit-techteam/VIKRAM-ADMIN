"use client";

import {
  Bar,
  BarChart,
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
import { cn } from "@/lib/utils";

export interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: string | number;
}

interface BarChartCardProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  className?: string;
  height?: number;
}

export function BarChartCard({
  title,
  description,
  data,
  dataKey = "value",
  xAxisKey = "label",
  color = "hsl(var(--primary))",
  className,
  height = 300,
}: BarChartCardProps) {
  return (
    <Card className={cn("shadow-card rounded-xl", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey={xAxisKey} className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Legend />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
