import React, { useEffect, useMemo, useRef } from "react";
import * as echarts from "echarts";

type Point = { label: string; paid: number; pending: number; cancelled: number };

type Props = {
  data: Point[];
  isWeekly?: boolean;
  title?: string;
  subtitle?: string;
};

export default function OrderChart({ data, isWeekly = false }: Props) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const chartData = useMemo(() => ({
    labels: data.map((item) => item.label),
    paid: data.map((item) => item.paid),
    pending: data.map((item) => item.pending),
    cancelled: data.map((item) => item.cancelled),
  }), [data]);

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
          const items = Array.isArray(params) ? params : [params];
          const axis = items?.[0]?.axisValue ?? "";
          const paid = items.find((p: any) => p.seriesName === "Đã hoàn thành")?.value ?? 0;
          const pending = items.find((p: any) => p.seriesName === "Đang xử lý / đang giao")?.value ?? 0;
          const cancelled = items.find((p: any) => p.seriesName === "Đã hủy")?.value ?? 0;
          return `
            <div style="font-weight:700;margin-bottom:6px;color:#1f2d27;">${axis}</div>
            <div>Đã hoàn thành: <b style="color:#588157;">${Number(paid)}</b></div>
            <div>Đang xử lý / đang giao: <b style="color:#d97706;">${Number(pending)}</b></div>
            <div>Đã hủy: <b style="color:#b91c1c;">${Number(cancelled)}</b></div>
          `;
        },
      },
      legend: {
        data: ["Đã hoàn thành", "Đang xử lý / đang giao", "Đã hủy"],
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
        name: "Đơn hàng",
        nameTextStyle: { color: "#7f9f6b", fontSize: 11, padding: [0, 0, 0, -10] },
        splitLine: { lineStyle: { color: "#cfd5c2", type: "dashed", opacity: 0.4 } },
        axisLabel: { color: "#7f9f6b", fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        { name: "Đã hoàn thành", type: "bar", barMaxWidth: 32, data: chartData.paid, itemStyle: { borderRadius: [8, 8, 0, 0], color: "#588157" } },
        { name: "Đang xử lý / đang giao", type: "bar", barMaxWidth: 32, data: chartData.pending, itemStyle: { borderRadius: [8, 8, 0, 0], color: "#d97706" } },
        { name: "Đã hủy", type: "bar", barMaxWidth: 32, data: chartData.cancelled, itemStyle: { borderRadius: [8, 8, 0, 0], color: "#b91c1c" } },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.current?.dispose();
    };
  }, [chartData]);

  return <div ref={chartRef} className="h-[360px] w-full" />;
}
