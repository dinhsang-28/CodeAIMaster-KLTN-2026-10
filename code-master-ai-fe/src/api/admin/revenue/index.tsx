import { API_URL } from "../../auth";
import axios from "axios";

export const GetRevenue = async (year: string) => {
  const Url = `${API_URL}/statistics/revenue-by-month?year=${year}`;
  try {
    const res = await axios.get(Url);
    console.log("THANH CONG: ", res.data);
    // ✅ FIX: trả về res.data (toàn bộ object), KHÔNG phải res.data.monthlyRevenue
    return res.data;
  } catch (err) {
    console.log("THAT BAI: ", err);
    throw err;
  }
};
export const GetRevenueExport = async (year: string) => {
  window.location.href = `${API_URL}/statistics/export-revenue-detail?year=${year}`;
};
