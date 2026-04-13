import React, { useEffect, useMemo, useState } from "react";
import RevenueChart, { RevenueReport } from "../../components/revenueChart";
import { GetRevenue, GetRevenueExport } from "../../api/admin/revenue";
import {
  InboxOutlined,
  CalendarOutlined,
  DollarOutlined,
  DownOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Dropdown } from "antd";

const items: MenuProps["items"] = [
  { key: "2022", label: <p>Năm 2022</p> },
  { key: "2023", label: <p>Năm 2023</p> },
  { key: "2024", label: <p>Năm 2024</p> },
  { key: "2025", label: <p>Năm 2025</p> },
  { key: "2026", label: <p>Năm 2026</p> },
];

const formatCurrency = (value?: number) =>
  `${(value ?? 0).toLocaleString("vi-VN")} VNĐ`;

const formatShortMoney = (value?: number) => {
  const v = value ?? 0;
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}K`;
  return `${v}`;
};

const GOAL = 1_500_000_000;

const IconRevenue = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-5 h-5"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 3H8L2 7h20L16 3z" />
    <path d="M12 11v6M9 14l3-3 3 3" />
  </svg>
);
const IconUp = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-5 h-5"
    stroke="currentColor"
    strokeWidth={2}
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);
const IconDown = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-5 h-5"
    stroke="currentColor"
    strokeWidth={2}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function RevenueStatisticsPage() {
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick: MenuProps["onClick"] = ({ key }) =>
    setSelectedYear(Number(key));

  const fetchRevenue = async (year: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await GetRevenue(year.toString());
      setReport(res);
    } catch {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueExport = async () => {
    try {
      setLoading(true);
      await GetRevenueExport(selectedYear.toString());
    } catch {
      setError("Không thể xuất file. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchRevenue(selectedYear), 300);
    return () => clearTimeout(t);
  }, [selectedYear]);

  const stats = useMemo(() => {
    if (!report) return null;
    const months = report.monthlyRevenue ?? [];
    const nonZero = months.filter((m) => m.revenue > 0);
    const highest = months.reduce(
      (max, m) => (m.revenue > max.revenue ? m : max),
      months[0] ?? { month: 1, revenue: 0, totalOrders: 0 },
    );
    const lowest =
      nonZero.length > 0
        ? nonZero.reduce(
            (min, m) => (m.revenue < min.revenue ? m : min),
            nonZero[0],
          )
        : { month: 1, revenue: 0, totalOrders: 0 };
    const avgRevenue = months.length ? report.totalRevenue / months.length : 0;
    const activeMonths = nonZero.length;
    const goalPercent = Math.min(
      100,
      Math.round((report.totalRevenue / GOAL) * 100),
    );
    return { highest, lowest, avgRevenue, activeMonths, goalPercent };
  }, [report]);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-8 md:px-10">
      <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
        {/* ── TITLE ROW ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            style={{ color: "#1f2d27" }}
          >
            Thống kê doanh thu
          </h1>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* Year picker */}
            <div
              className="flex items-center gap-2 rounded-xl border px-3 sm:px-4 py-2 cursor-pointer hover:border-brand-200 transition-all"
              style={{ backgroundColor: "#f3f2ef", color: "#344e41" }}
            >
              <div
                className="flex items-center gap-1 text-xs sm:text-sm font-semibold"
                style={{ color: "#7f9f6b" }}
              >
                <CalendarOutlined />
                <span className="hidden sm:inline">KỲ BÁO CÁO</span>
              </div>
              <Dropdown menu={{ items, onClick }} placement="bottomLeft">
                <p
                  onClick={(e) => e.preventDefault()}
                  className="bg-transparent font-bold text-xs sm:text-sm outline-none cursor-pointer whitespace-nowrap"
                >
                  Năm {selectedYear} <DownOutlined />
                </p>
              </Dropdown>
            </div>

            {/* Export */}
            <div
              onClick={fetchRevenueExport}
              className="flex items-center justify-center gap-2 bg-brand-25 rounded-lg border border-brand-50 hover:border-brand-200 font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 cursor-pointer whitespace-nowrap"
            >
              <span className="hidden sm:inline">Export file</span>
              <ExportOutlined />
            </div>
          </div>
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div
            className="rounded-xl border px-4 py-3 text-sm font-medium"
            style={{
              borderColor: "#588157",
              color: "#3a5a40",
              backgroundColor: "#cfd5c2",
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            icon={<IconRevenue />}
            label="TỔNG DOANH THU NĂM"
            main={formatCurrency(report?.totalRevenue)}
            sub={`TB ${formatShortMoney(stats?.avgRevenue)} / tháng`}
            iconBg="#a3b18a"
            iconColor="#1f2d27"
          />
          <StatCard
            icon={<IconUp />}
            label="THÁNG CAO NHẤT"
            main={`Tháng ${stats?.highest.month ?? "—"}`}
            sub={formatCurrency(stats?.highest.revenue)}
            iconBg="#588157"
            iconColor="#dad7cd"
          />
          <StatCard
            icon={<IconDown />}
            label="THÁNG THẤP NHẤT"
            main={`Tháng ${stats?.lowest.month ?? "—"}`}
            sub={formatCurrency(stats?.lowest.revenue)}
            iconBg="#cfd5c2"
            iconColor="#344e41"
          />
        </div>

        {/* ── CHART ── */}
        <div
          className="rounded-2xl p-4 sm:p-6 shadow-sm"
          style={{ backgroundColor: "#f3f2ef" }}
        >
          <div className="mb-3 sm:mb-1">
            <h2
              className="text-base sm:text-lg font-bold"
              style={{ color: "#1f2d27" }}
            >
              Biểu đồ doanh thu hàng tháng
            </h2>
            <p className="text-xs sm:text-sm" style={{ color: "#7f9f6b" }}>
              Theo dõi biến động doanh thu trong năm {selectedYear}
            </p>
          </div>

          {loading ? (
            <div className="flex h-52 sm:h-[360px] items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : report ? (
            <RevenueChart data={report} />
          ) : (
            <div
              className="flex h-52 sm:h-[360px] items-center justify-center text-sm"
              style={{ color: "#7f9f6b" }}
            >
              Chưa có dữ liệu
            </div>
          )}
        </div>

        {/* ── BOTTOM ROW ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Phân tích tăng trưởng */}
          <div
            className="rounded-2xl p-4 sm:p-6 shadow-sm"
            style={{ backgroundColor: "#f3f2ef" }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h3
                className="font-bold text-sm sm:text-base"
                style={{ color: "#1f2d27" }}
              >
                Phân tích tăng trưởng
              </h3>
              <button
                className="text-xs font-bold px-3 py-1 rounded-lg"
                style={{ color: "#588157", backgroundColor: "#cfd5c2" }}
              >
                CHI TIẾT
              </button>
            </div>
            <div className="space-y-3">
              <AnalysisRow
                icon={<InboxOutlined />}
                title="Tổng đơn hàng"
                desc={`${report?.totalOrders ?? 0} đơn trong năm ${selectedYear}`}
                value={`${report?.totalOrders ?? 0} đơn`}
              />
              <AnalysisRow
                icon={<CalendarOutlined />}
                title="Tháng có doanh thu"
                desc={`${stats?.activeMonths ?? 0} / 12 tháng hoạt động`}
                value={`${stats?.activeMonths ?? 0}/12`}
              />
              <AnalysisRow
                icon={<DollarOutlined />}
                title="Doanh thu trung bình"
                desc="Trung bình mỗi tháng"
                value={formatShortMoney(stats?.avgRevenue)}
              />
            </div>
          </div>

          {/* Mục tiêu năm */}
          <div
            className="rounded-2xl p-4 sm:p-6 shadow-sm"
            style={{ backgroundColor: "#344e41", color: "#dad7cd" }}
          >
            <h3
              className="font-bold text-sm sm:text-base mb-1"
              style={{ color: "#cfd5c2" }}
            >
              Mục tiêu Năm {selectedYear}
            </h3>
            <p className="text-xs mb-4 sm:mb-6" style={{ color: "#7f9f6b" }}>
              Theo dõi tiến độ đạt mục tiêu doanh thu
            </p>

            <div className="mb-4 sm:mb-6">
              <div
                className="flex justify-between text-xs mb-2 gap-2"
                style={{ color: "#a3b18a" }}
              >
                <span>TIẾN ĐỘ DOANH THU</span>
                <span
                  className="font-bold shrink-0"
                  style={{ color: "#dad7cd" }}
                >
                  {formatShortMoney(report?.totalRevenue)} /{" "}
                  {formatShortMoney(GOAL)} ({stats?.goalPercent ?? 0}%)
                </span>
              </div>
              <div
                className="h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: "#1f2d27" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${stats?.goalPercent ?? 0}%`,
                    backgroundColor: "#588157",
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                {
                  label: "ĐẠT ĐƯỢC",
                  val: formatShortMoney(report?.totalRevenue),
                  color: "#a3b18a",
                },
                {
                  label: "CÒN THIẾU",
                  val: formatShortMoney(
                    Math.max(0, GOAL - (report?.totalRevenue ?? 0)),
                  ),
                  color: "#cfd5c2",
                },
                {
                  label: "TIẾN ĐỘ",
                  val: `${stats?.goalPercent ?? 0}%`,
                  color: "#7f9f6b",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl p-2 sm:p-3 text-center"
                  style={{ backgroundColor: "#2c3e36" }}
                >
                  <p
                    className="text-sm sm:text-base font-extrabold"
                    style={{ color: item.color }}
                  >
                    {item.val}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#7f9f6b" }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <button
              className="mt-4 sm:mt-5 w-full rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#dad7cd", color: "#344e41" }}
            >
              CẬP NHẬT MỤC TIÊU {selectedYear + 1}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  main,
  sub,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  main: string;
  sub: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 sm:p-5 shadow-sm flex gap-3 sm:gap-4 items-center"
      style={{ backgroundColor: "#f3f2ef" }}
    >
      <div
        className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p
          className="text-xs font-bold tracking-widest mb-1"
          style={{ color: "#7f9f6b" }}
        >
          {label}
        </p>
        <p
          className="text-base sm:text-xl font-extrabold leading-tight truncate"
          style={{ color: "#1f2d27" }}
        >
          {main}
        </p>
        <p className="text-xs mt-1 truncate" style={{ color: "#a3b18a" }}>
          {sub}
        </p>
      </div>
    </div>
  );
}

function AnalysisRow({
  icon,
  title,
  desc,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-xl px-3 sm:px-4 py-3"
      style={{ backgroundColor: "#dad7cd" }}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-base shrink-0"
          style={{ backgroundColor: "#cfd5c2" }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p
            className="text-xs sm:text-sm font-semibold truncate"
            style={{ color: "#1f2d27" }}
          >
            {title}
          </p>
          <p className="text-xs truncate" style={{ color: "#7f9f6b" }}>
            {desc}
          </p>
        </div>
      </div>
      <span
        className="font-extrabold text-xs sm:text-sm shrink-0 ml-2"
        style={{ color: "#588157" }}
      >
        {value}
      </span>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="h-8 w-8 animate-spin rounded-full border-4"
        style={{ borderColor: "#588157", borderTopColor: "transparent" }}
      />
      <span className="text-sm" style={{ color: "#7f9f6b" }}>
        Đang tải dữ liệu...
      </span>
    </div>
  );
}
