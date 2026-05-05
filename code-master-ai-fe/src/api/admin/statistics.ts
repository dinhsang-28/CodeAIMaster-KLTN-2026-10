import axios from "axios";
import { API_URL } from "../../api/auth";

export type WeeklyRevenueItem = {
  day: number;
  revenue: number;
  totalOrders: number;
};

export type WeeklyRevenueResponse = {
  startOfWeek?: string;
  endOfWeek?: string;
  totalRevenue?: number;
  totalOrders?: number;
  weeklyData?: WeeklyRevenueItem[];
};

export type OrderStatisticItem = {
  month?: number;
  day?: number;
  totalOrders?: number;
  totalOrdersPaid?: number;
  totalOrdersPending?: number;
  totalOrdersCancel?: number;
};

export type OrderByMonthResponse = {
  year?: number;
  totalOrders?: number;
  totalOrdersPaid?: number;
  totalOrdersPending?: number;
  totalOrdersCancel?: number;
  monthlyOrders?: OrderStatisticItem[];
  monthlyRevenue?: OrderStatisticItem[];
};

export type OrderByWeekResponse = {
  startOfWeek?: string;
  endOfWeek?: string;
  totalOrders?: number;
  totalOrdersPaid?: number;
  totalOrdersPending?: number;
  totalOrdersCancel?: number;
  weeklyOrders?: OrderStatisticItem[];
};

const buildUrl = (path: string, params: Record<string, string>) => {
  const url = new URL(`${API_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
};

export const getRevenueByWeek = (date: string) =>
  axios.get<WeeklyRevenueResponse>(buildUrl("/statistics/revenue-by-week", { date })).then((r) => r.data);

export const getOrderByMonth = (year: string) =>
  axios.get<OrderByMonthResponse>(buildUrl("/statistics/order-by-month", { year })).then((r) => r.data);

export const getOrderByWeek = (date: string) =>
  axios.get<OrderByWeekResponse>(buildUrl("/statistics/order-by-week", { date })).then((r) => r.data);

export const exportOrderDetail = (year: string) => {
  window.open(buildUrl("/statistics/export-order-detail", { year }), "_blank", "noopener,noreferrer");
};
