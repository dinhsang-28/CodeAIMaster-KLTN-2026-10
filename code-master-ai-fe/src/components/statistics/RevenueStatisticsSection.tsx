import React, { useEffect, useMemo, useState } from "react";
import { Dropdown, type MenuProps } from "antd";
import { CalendarOutlined, DownOutlined } from "@ant-design/icons";
import RevenueChart, { RevenueReport } from "../revenueChart";
import WeekNavigator from "./WeekNavigator";
import SummaryCard from "./SummaryCard";
import { getRevenueByWeek, type WeeklyRevenueResponse } from "../../api/admin/statistics";
import { GetRevenueExport } from "../../api/admin/revenue";
import dayjs from "dayjs";

const yearItems: MenuProps["items"] = [2022, 2023, 2024, 2025, 2026].map((year) => ({
  key: String(year),
  label: <p>Năm {year}</p>,
}));

const toDateInput = (date: Date) => date.toISOString().slice(0, 10);
const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatSub = (sub?: string) => {
    if (!sub) return "";

    const dates = sub.split(" - ");

    const isDateRange =
      dates.length === 2 &&
      dates.every((date) => dayjs(date).isValid());

    if (isDateRange) {
      return dates
        .map((date) => dayjs(date).format("DD/MM/YYYY"))
        .join(" - ");
    }

    return sub;
  };

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const GOAL = 1_500_000_000;

const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function RevenueStatisticsSection() {
  const [year, setYear] = useState(2026);
  const [activeTab, setActiveTab] = useState<"month" | "week">("month");
  const [monthlyReport, setMonthlyReport] = useState<RevenueReport | null>(null);
  const [weekReport, setWeekReport] = useState<WeeklyRevenueResponse | null>(null);
  const [weekDate, setWeekDate] = useState(() => toDateInput(new Date()));
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonth = async (selectedYear: number) => {
    try {
      setLoadingMonth(true);
      setError(null);
      const mod = await import("../../api/admin/revenue");
      const res = await mod.GetRevenue(String(selectedYear));
      setMonthlyReport(res);
    } catch {
      setError("Không thể tải doanh thu theo tháng.");
    } finally {
      setLoadingMonth(false);
    }
  };

  const fetchWeek = async (date: string) => {
    try {
      setLoadingWeek(true);
      setError(null);
      const res = await getRevenueByWeek(date);
      setWeekReport(res);
    } catch {
      setError("Không thể tải doanh thu theo tuần.");
    } finally {
      setLoadingWeek(false);
    }
  };

  useEffect(() => {
    fetchMonth(year);
  }, [year]);

  useEffect(() => {
    fetchWeek(weekDate);
  }, [weekDate]);

  const monthStats = useMemo(() => {
    const months = monthlyReport?.monthlyRevenue ?? [];
    const nonZero = months.filter((m) => m.revenue > 0);
    const highest = months.reduce((max, m) => (m.revenue > max.revenue ? m : max), months[0] ?? { month: 1, revenue: 0, totalOrders: 0 });
    const lowest = nonZero.length > 0 ? nonZero.reduce((min, m) => (m.revenue < min.revenue ? m : min), nonZero[0]) : { month: 1, revenue: 0, totalOrders: 0 };
    const avg = months.length ? (monthlyReport?.totalRevenue ?? 0) / months.length : 0;
    return { highest, lowest, avg, activeMonths: nonZero.length };
  }, [monthlyReport]);

  const weekLabel = useMemo(() => {
    const s = weekReport?.startOfWeek;
    const e = weekReport?.endOfWeek;
    return s && e ? `${s} - ${e}` : weekDate;
  }, [weekReport, weekDate]);

  const weekChartData = useMemo(() => {
    const arr = Array.from({ length: 7 }, (_, idx) => {
      const item = weekReport?.weeklyData?.find((d) => d.day === idx + 1);
      return {
        month: idx + 1,
        label: dayLabels[idx],
        revenue: item?.revenue ?? 0,
      };
    });
    return { weeklyData: arr };
  }, [weekReport]);

  const onWeekMove = (delta: number) => {
    const base = startOfWeek(new Date(weekDate));
    const next = addDays(base, delta * 7);
    setWeekDate(toDateInput(next));
  };

  return (
    <section className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "#1f2d27" }}>Thống kê doanh thu</h1>
          <p className="mt-1 text-sm text-slate-500">Theo dõi doanh thu theo tháng và theo tuần hiện tại</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded-xl border px-3 sm:px-4 py-2 cursor-pointer hover:border-brand-200 transition-all" style={{ backgroundColor: "#f3f2ef", color: "#344e41" }}>
            <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold" style={{ color: "#7f9f6b" }}>
              <CalendarOutlined />
              <span className="hidden sm:inline">KỲ BÁO CÁO</span>
            </div>
            <Dropdown menu={{ items: yearItems, onClick: ({ key }) => setYear(Number(key)) }} placement="bottomLeft">
              <p className="bg-transparent font-bold text-xs sm:text-sm outline-none cursor-pointer whitespace-nowrap" onClick={(e) => e.preventDefault()}>
                Năm {year} <DownOutlined />
              </p>
            </Dropdown>
          </div>
          <div onClick={() => GetRevenueExport(String(year))} className="flex items-center justify-center gap-2 bg-brand-25 rounded-lg border border-brand-50 hover:border-brand-200 font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 cursor-pointer whitespace-nowrap">
                      <span className="hidden sm:inline">Export file</span>
                      <span>↓</span>
                    </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border px-4 py-3 text-sm font-medium" style={{ borderColor: "#588157", color: "#3a5a40", backgroundColor: "#cfd5c2" }}>
          ⚠ {error}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => setActiveTab("month")} className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${activeTab === "month" ? "bg-[#344e41] text-white" : "bg-[#f3f2ef] text-[#344e41]"}`}>
          Theo tháng
        </button>
        <button onClick={() => setActiveTab("week")} className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${activeTab === "week" ? "bg-[#344e41] text-white" : "bg-[#f3f2ef] text-[#344e41]"}`}>
          Theo tuần hiện tại
        </button>
      </div>

      {activeTab === "month" ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <SummaryCard label="TỔNG DOANH THU NĂM" value={`${(monthlyReport?.totalRevenue ?? 0).toLocaleString("vi-VN")} VNĐ`} sub={`TB ${Math.round(monthStats.avg).toLocaleString("vi-VN")} / tháng`} />
          <SummaryCard label="THÁNG CAO NHẤT" value={`Tháng ${monthStats.highest.month ?? "—"}`} sub={`${(monthStats.highest.revenue ?? 0).toLocaleString("vi-VN")} VNĐ`} />
          <SummaryCard label="THÁNG THẤP NHẤT" value={`Tháng ${monthStats.lowest.month ?? "—"}`} sub={`${(monthStats.lowest.revenue ?? 0).toLocaleString("vi-VN")} VNĐ`} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <SummaryCard label="TỔNG DOANH THU TUẦN" value={`${(weekReport?.totalRevenue ?? 0).toLocaleString("vi-VN")} VNĐ`} sub={weekLabel} />
          <SummaryCard label="SỐ NGÀY CÓ DỮ LIỆU" value={`${weekReport?.weeklyData?.length ?? 0}/7`} sub="Theo tuần hiện tại" />
          <SummaryCard label="DOANH THU TB / NGÀY" value={`${Math.round((weekReport?.totalRevenue ?? 0) / 7).toLocaleString("vi-VN")} VNĐ`} sub="Bình quân" />
        </div>
      )}

      {activeTab === "month" ? (
        <div className="rounded-2xl p-4 sm:p-6 shadow-sm" style={{ backgroundColor: "#f3f2ef" }}>
          <div className="mb-3 sm:mb-1">
            <h2 className="text-base sm:text-lg font-bold" style={{ color: "#1f2d27" }}>Biểu đồ doanh thu hàng tháng</h2>
            <p className="text-xs sm:text-sm" style={{ color: "#7f9f6b" }}>Theo dõi biến động doanh thu trong năm {year}</p>
          </div>
          {loadingMonth ? <LoadingBlock /> : monthlyReport ? <RevenueChart data={monthlyReport} /> : <EmptyText />}
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl p-4 sm:p-6 shadow-sm" style={{ backgroundColor: "#f3f2ef" }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base sm:text-lg font-bold" style={{ color: "#1f2d27" }}>Biểu đồ doanh thu theo tuần</h2>
              <p className="text-xs sm:text-sm" style={{ color: "#7f9f6b" }}>{formatSub(weekLabel)}</p>
            </div>
            <WeekNavigator
              label={formatSub(weekLabel)}
              onPrev={() => onWeekMove(-1)}
              onCurrent={() => setWeekDate(toDateInput(new Date()))}
              onNext={() => onWeekMove(1)}
            />
          </div>
          {loadingWeek ? <LoadingBlock /> : weekReport ? <RevenueChart data={weekChartData as any} isWeekly /> : <EmptyText />}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl p-4 sm:p-6 shadow-sm" style={{ backgroundColor: "#f3f2ef" }}>
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h3 className="font-bold text-sm sm:text-base" style={{ color: "#1f2d27" }}>Phân tích tăng trưởng</h3>
            <button className="text-xs font-bold px-3 py-1 rounded-lg" style={{ color: "#588157", backgroundColor: "#cfd5c2" }}>CHI TIẾT</button>
          </div>
          <div className="space-y-3">
            <AnalysisRow title="Tổng đơn hàng" desc={`${monthlyReport?.totalOrders ?? 0} đơn trong năm ${year}`} value={`${monthlyReport?.totalOrders ?? 0} đơn`} />
            <AnalysisRow title="Tháng có doanh thu" desc={`${monthStats.activeMonths ?? 0} / 12 tháng hoạt động`} value={`${monthStats.activeMonths ?? 0}/12`} />
            <AnalysisRow title="Doanh thu trung bình" desc="Trung bình mỗi tháng" value={`${Math.round(monthStats.avg).toLocaleString("vi-VN")} VNĐ`} />
          </div>
        </div>

        <div className="rounded-2xl p-4 sm:p-6 shadow-sm" style={{ backgroundColor: "#344e41", color: "#dad7cd" }}>
          <h3 className="font-bold text-sm sm:text-base mb-1" style={{ color: "#cfd5c2" }}>Mục tiêu Năm {year}</h3>
          <p className="text-xs mb-4 sm:mb-6" style={{ color: "#7f9f6b" }}>Theo dõi tiến độ đạt mục tiêu doanh thu</p>
          <div className="flex flex-col justify-center">
            <div className="mb-4 sm:mb-6">
            <div className="flex justify-between text-xs mb-2 gap-2" style={{ color: "#a3b18a" }}>
              <span>TIẾN ĐỘ DOANH THU</span>
              <span className="font-bold shrink-0" style={{ color: "#dad7cd" }}>
                {(monthlyReport?.totalRevenue ?? 0).toLocaleString("vi-VN")} / {GOAL.toLocaleString("vi-VN")} ({Math.min(100, Math.round((monthlyReport?.totalRevenue ?? 0) / GOAL * 100))}%)
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#1f2d27" }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Math.round((monthlyReport?.totalRevenue ?? 0) / GOAL * 100))}%`, backgroundColor: "#588157" }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: "ĐẠT ĐƯỢC", val: `${(monthlyReport?.totalRevenue ?? 0).toLocaleString("vi-VN")}`, color: "#a3b18a" },
              { label: "CÒN THIẾU", val: `${Math.max(0, GOAL - (monthlyReport?.totalRevenue ?? 0)).toLocaleString("vi-VN")}`, color: "#cfd5c2" },
              { label: "TIẾN ĐỘ", val: `${Math.min(100, Math.round((monthlyReport?.totalRevenue ?? 0) / GOAL * 100))}%`, color: "#7f9f6b" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-2 sm:p-3 text-center flex flex-col justify-center" style={{ backgroundColor: "#2c3e36" }}>
                <p className="text-sm sm:text-base font-extrabold" style={{ color: item.color }}>{item.val}</p>
                <p className="text-xs mt-1" style={{ color: "#7f9f6b" }}>{item.label}</p>
              </div>
            ))}
          </div>
          </div>
          {/* <button className="mt-4 sm:mt-5 w-full rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-opacity hover:opacity-80" style={{ backgroundColor: "#dad7cd", color: "#344e41" }}>
            CẬP NHẬT MỤC TIÊU {year + 1}
          </button> */}
        </div>
      </div>
    </section>
  );
}

function EmptyText() {
  return <div className="flex h-52 items-center justify-center text-sm" style={{ color: "#7f9f6b" }}>Không có dữ liệu</div>;
}

function LoadingBlock() {
  return <div className="flex h-52 items-center justify-center text-sm" style={{ color: "#7f9f6b" }}>Đang tải dữ liệu...</div>;
}

function AnalysisRow({ title, desc, value }: { title: string; desc: string; value: string; }) {
  return (
    <div className="flex items-center justify-between rounded-xl px-3 sm:px-4 py-3" style={{ backgroundColor: "#dad7cd" }}>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-semibold truncate" style={{ color: "#1f2d27" }}>{title}</p>
        <p className="text-xs truncate" style={{ color: "#7f9f6b" }}>{desc}</p>
      </div>
      <span className="font-extrabold text-xs sm:text-sm shrink-0 ml-2" style={{ color: "#588157" }}>{value}</span>
    </div>
  );
}
