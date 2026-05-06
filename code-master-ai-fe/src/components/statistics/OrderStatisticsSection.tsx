import React, { useEffect, useMemo, useState } from "react";
import { Dropdown, type MenuProps } from "antd";
import { CalendarOutlined, DownOutlined } from "@ant-design/icons";
import SummaryCard from "./SummaryCard";
import WeekNavigator from "./WeekNavigator";
import OrderChart from "./OrderChart";
import { getOrderByMonth, getOrderByWeek, exportOrderDetail } from "../../api/admin/statistics";

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
const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};
const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function OrderStatisticsSection() {
  const [year, setYear] = useState(2026);
  const [activeTab, setActiveTab] = useState<"month" | "week">("month");
  const [weekDate, setWeekDate] = useState(() => toDateInput(new Date()));
  const [monthData, setMonthData] = useState<any>(null);
  const [weekData, setWeekData] = useState<any>(null);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonth = async (y: number) => {
    try {
      setLoadingMonth(true);
      setError(null);
      setMonthData(await getOrderByMonth(String(y)));
    } catch {
      setError("Không thể tải thống kê đơn hàng theo tháng.");
    } finally {
      setLoadingMonth(false);
    }
  };

  const fetchWeek = async (date: string) => {
    try {
      setLoadingWeek(true);
      setError(null);
      setWeekData(await getOrderByWeek(date));
    } catch {
      setError("Không thể tải thống kê đơn hàng theo tuần.");
    } finally {
      setLoadingWeek(false);
    }
  };

  useEffect(() => { fetchMonth(year); }, [year]);
  useEffect(() => { fetchWeek(weekDate); }, [weekDate]);

  const monthPoints = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({ label: `TH${i + 1}`, paid: 0, pending: 0, cancelled: 0 }));
    const list = monthData?.monthlyOrders || monthData?.monthlyRevenue || [];
    (list || []).forEach((item: any) => {
      const idx = (item.month ?? 1) - 1;
      if (idx >= 0 && idx < 12) {
        months[idx] = {
          label: `TH${idx + 1}`,
          paid: Number(item.totalOrdersPaid ?? 0),
          pending: Number(item.totalOrdersPending ?? 0),
          cancelled: Number(item.totalOrdersCancel ?? 0),
        };
      }
    });
    return months;
  }, [monthData]);

  const weekPoints = useMemo(() => {
    const days = dayLabels.map((label) => ({ label, paid: 0, pending: 0, cancelled: 0 }));
    const list = weekData?.weeklyOrders || [];
    (list || []).forEach((item: any) => {
      const idx = (item.day ?? 1) - 1;
      if (idx >= 0 && idx < 7) {
        days[idx] = {
          label: dayLabels[idx],
          paid: Number(item.totalOrdersPaid ?? 0),
          pending: Number(item.totalOrdersPending ?? 0),
          cancelled: Number(item.totalOrdersCancel ?? 0),
        };
      }
    });
    return days;
  }, [weekData]);

  const monthStats = useMemo(() => ({
    total: monthPoints.reduce((s, i) => s + i.paid + i.pending + i.cancelled, 0),
    paid: monthPoints.reduce((s, i) => s + i.paid, 0),
    pending: monthPoints.reduce((s, i) => s + i.pending, 0),
    cancelled: monthPoints.reduce((s, i) => s + i.cancelled, 0),
  }), [monthPoints]);

  const weekStats = useMemo(() => ({
    total: weekPoints.reduce((s, i) => s + i.paid + i.pending + i.cancelled, 0),
    paid: weekPoints.reduce((s, i) => s + i.paid, 0),
    pending: weekPoints.reduce((s, i) => s + i.pending, 0),
    cancelled: weekPoints.reduce((s, i) => s + i.cancelled, 0),
  }), [weekPoints]);

  const weekLabel = useMemo(() => {
    const start = weekData?.startOfWeek;
    const end = weekData?.endOfWeek;
    return start && end ? `${start} - ${end}` : weekDate;
  }, [weekData, weekDate]);

  const currentStart = useMemo(() => startOfWeek(new Date(weekDate)), [weekDate]);

  return (
    <section className="space-y-5 sm:space-y-6 mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: "#1f2d27" }}>Thống kê đơn hàng</h2>
          <p className="mt-1 text-sm text-slate-500">Theo dõi đơn hàng theo tháng và theo tuần hiện tại</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded-xl border px-3 sm:px-4 py-2 cursor-pointer hover:border-brand-200 transition-all" style={{ backgroundColor: "#f3f2ef", color: "#344e41" }}>
            <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold" style={{ color: "#7f9f6b" }}>
              <CalendarOutlined />
              <span className="hidden sm:inline">NĂM</span>
            </div>
            <Dropdown menu={{ items: yearItems, onClick: ({ key }) => setYear(Number(key)) }} placement="bottomLeft">
              <p onClick={(e) => e.preventDefault()} className="bg-transparent font-bold text-xs sm:text-sm outline-none cursor-pointer whitespace-nowrap">
                Năm {year} <DownOutlined />
              </p>
            </Dropdown>
          </div>
          <div onClick={() => exportOrderDetail(String(year))} className="flex items-center justify-center gap-2 bg-brand-25 rounded-lg border border-brand-50 hover:border-brand-200 font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 cursor-pointer whitespace-nowrap">
            <span className="hidden sm:inline">Export file</span>
            <span>↓</span>
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl border px-4 py-3 text-sm font-medium" style={{ borderColor: "#588157", color: "#3a5a40", backgroundColor: "#cfd5c2" }}>⚠ {error}</div>}

      <div className="flex gap-2">
        <button onClick={() => setActiveTab("month")} className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${activeTab === "month" ? "bg-[#344e41] text-white" : "bg-[#f3f2ef] text-[#344e41]"}`}>Theo tháng</button>
        <button onClick={() => setActiveTab("week")} className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${activeTab === "week" ? "bg-[#344e41] text-white" : "bg-[#f3f2ef] text-[#344e41]"}`}>Theo tuần hiện tại</button>
      </div>

      {activeTab === "month" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
            <SummaryCard label="TỔNG ĐƠN HÀNG NĂM" value={monthStats.total} sub={`Năm ${year}`} />
            <SummaryCard label="ĐÃ HOÀN THÀNH" value={monthStats.paid} sub="totalOrdersPaid" />
            <SummaryCard label="ĐANG XỬ LÝ / ĐANG GIAO" value={monthStats.pending} sub="totalOrdersPending" />
            <SummaryCard label="ĐÃ HỦY" value={monthStats.cancelled} sub="totalOrdersCancel" />
          </div>
          <div className="rounded-2xl p-4 sm:p-6 shadow-sm" style={{ backgroundColor: "#f3f2ef" }}>
            <div className="mb-3 sm:mb-1">
              <h3 className="text-base sm:text-lg font-bold" style={{ color: "#1f2d27" }}>Biểu đồ đơn hàng theo tháng</h3>
              <p className="text-xs sm:text-sm" style={{ color: "#7f9f6b" }}>12 tháng, mỗi tháng 3 cột trạng thái</p>
            </div>
            {loadingMonth ? <Loading /> : <OrderChart data={monthPoints} />}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
            <SummaryCard label="TỔNG ĐƠN HÀNG TUẦN" value={weekStats.total} sub={weekLabel} />
            <SummaryCard label="ĐÃ HOÀN THÀNH" value={weekStats.paid} sub="totalOrdersPaid" />
            <SummaryCard label="ĐANG XỬ LÝ / ĐANG GIAO" value={weekStats.pending} sub="totalOrdersPending" />
            <SummaryCard label="ĐÃ HỦY" value={weekStats.cancelled} sub="totalOrdersCancel" />
          </div>
          <div className="rounded-2xl p-4 sm:p-6 shadow-sm space-y-4" style={{ backgroundColor: "#f3f2ef" }}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-base sm:text-lg font-bold" style={{ color: "#1f2d27" }}>Biểu đồ đơn hàng theo tuần</h3>
                <p className="text-xs sm:text-sm" style={{ color: "#7f9f6b" }}>{weekLabel}</p>
              </div>
              <WeekNavigator label={weekLabel} onPrev={() => setWeekDate(toDateInput(addDays(currentStart, -7)))} onCurrent={() => setWeekDate(toDateInput(new Date()))} onNext={() => setWeekDate(toDateInput(addDays(currentStart, 7)))} />
            </div>
            {loadingWeek ? <Loading /> : <OrderChart data={weekPoints} isWeekly />}
          </div>
        </>
      )}
    </section>
  );
}

function Loading() {
  return <div className="flex h-52 items-center justify-center text-sm" style={{ color: "#7f9f6b" }}>Đang tải dữ liệu...</div>;
}
