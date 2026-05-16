import axiosInstance from "../../../utils/axios";

export const GetRevenue = async (year: string) => {
  try {
    const res = await axiosInstance.get("/statistics/revenue-by-month", {
      params: { year },
    });
    console.log("THANH CONG: ", res.data);
    // ✅ FIX: trả về res.data (toàn bộ object), KHÔNG phải res.data.monthlyRevenue
    return res.data;
  } catch (err) {
    console.log("THAT BAI: ", err);
    throw err;
  }
};
export const GetRevenueExport = async (year: string) => {
  const response = await axiosInstance.get<Blob>(
    "/statistics/export-revenue-detail",
    {
      params: { year },
      responseType: "blob",
    },
  );

  const blobUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `revenue-detail-${year}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};
