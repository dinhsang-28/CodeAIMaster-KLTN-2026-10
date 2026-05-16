import axiosInstance from "../../utils/axios";

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

export const getRevenueByWeek = (date: string) =>
  axiosInstance
    .get<WeeklyRevenueResponse>("/statistics/revenue-by-week", {
      params: { date },
    })
    .then((r) => r.data);

export const getOrderByMonth = (year: string) =>
  axiosInstance
    .get<OrderByMonthResponse>("/statistics/order-by-month", {
      params: { year },
    })
    .then((r) => r.data);

export const getOrderByWeek = (date: string) =>
  axiosInstance
    .get<OrderByWeekResponse>("/statistics/order-by-week", {
      params: { date },
    })
    .then((r) => r.data);

export const exportOrderDetail = async (year: string) => {
  const response = await axiosInstance.get<Blob>(
    "/statistics/export-order-detail",
    {
      params: { year },
      responseType: "blob",
    },
  );

  const blobUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `order-detail-${year}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};
