"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

import { SegmentedToggle } from "@/components/shared/SegmentedToggle";
import type { RevenuePoint } from "@/features/dashboard/types/dashboard.types";

interface RevenueTrendChartProps {
  data: RevenuePoint[];
  highlightIndex: number;
}

type ChartPeriod = "daily" | "monthly";

export function RevenueTrendChart({
  data,
  highlightIndex,
}: RevenueTrendChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>("monthly");

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Revenue Trend
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Visualizing revenue inflow across all regions
          </p>
        </div>
        <SegmentedToggle
          options={[
            { label: "Daily", value: "daily" },
            { label: "Monthly", value: "monthly" },
          ]}
          value={period}
          onChange={setPeriod}
        />
      </div>

      <div className="mt-6 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F1F5F9"
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell
                  key={entry.month}
                  fill={index === highlightIndex ? "#FF6B00" : "#E4E7F5"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
