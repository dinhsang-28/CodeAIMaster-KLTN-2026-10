import React, { useEffect, useMemo, useRef } from "react";
import * as echarts from "echarts";

export interface MonthlyRevenueItem {
  month: number;
  revenue: number;
  totalOrders?: number;
  label?: string;
}

export interface RevenueReport {
  year?: number;
  totalRevenue?: number;
  totalOrders?: number;
  monthlyRevenue?: MonthlyRevenueItem[];
  weeklyData?: MonthlyRevenueItem[];
}

type RevenueChartProps = {
  data?: RevenueReport | null;
  xKey?: string;
  revenueKey?: string;
  title?: string;
  subtitle?: string;
  isWeekly?: boolean;
  className?: string;
};

const monthLabels = ["TH1", "TH2", "TH3", "TH4", "TH5", "TH6", "TH7", "TH8", "TH9", "TH10", "TH11", "TH12"];
const weekLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const formatCurrency = (value: number) => `${(value ?? 0).toLocaleString("vi-VN")} VNĐ`;
const formatShortMoney = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return `${value}`;
};

export default function RevenueChart({ data, isWeekly = false, className = "" }: RevenueChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const chartData = useMemo(() => {
    const source = isWeekly ? (data?.weeklyData ?? []) : (data?.monthlyRevenue ?? []);
    const labels = isWeekly ? weekLabels : monthLabels;
    return {
      labels,
      values: labels.map((_, idx) => Number(source[idx]?.revenue ?? 0)),
    };
  }, [data, isWeekly]);

  useEffect(() => {
    if (!chartRef.current) return;
    chartInstance.current?.dispose();
    chartInstance.current = echarts.init(chartRef.current);
    const chart = chartInstance.current;

    chart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "#fff",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        textStyle: { color: "#1f2d27", fontSize: 13 },
        extraCssText: "box-shadow: 0 10px 24px rgba(0,0,0,0.12); border-radius: 12px;",
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params;
          return `<div style="font-weight:700;margin-bottom:6px;color:#1f2d27;">${item?.axisValue ?? ""}</div><div>Doanh thu: <b style="color:#588157;">${formatCurrency(Number(item?.value ?? 0))}</b></div>`;
        },
      },
      legend: {
        data: ["Doanh thu"],
        top: 8,
        right: 0,
        textStyle: { color: "#7f9f6b", fontSize: 12 },
        itemWidth: 10,
        itemHeight: 10,
      },
      grid: { left: 20, right: 20, bottom: 10, top: 50, containLabel: true },
      xAxis: {
        type: "category",
        data: chartData.labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#7f9f6b", fontSize: 12, fontWeight: 500 },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        name: "Doanh thu",
        nameTextStyle: { color: "#7f9f6b", fontSize: 11, padding: [0, 0, 0, -10] },
        splitLine: { lineStyle: { color: "#cfd5c2", type: "dashed", opacity: 0.4 } },
        axisLabel: { color: "#7f9f6b", fontSize: 11, formatter: (v: any) => formatShortMoney(Number(v)) },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          name: "Doanh thu",
          type: "bar",
          barMaxWidth: 44,
          data: chartData.values,
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#588157" },
              { offset: 1, color: "#3a5a40" },
            ]),
          },
        },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.current?.dispose();
    };
  }, [chartData]);

  return <div ref={chartRef} className={`h-[360px] w-full ${className}`} />;
}
