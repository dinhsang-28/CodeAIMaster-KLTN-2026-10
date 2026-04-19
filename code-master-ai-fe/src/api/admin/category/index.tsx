import axiosInstance from "../../../utils/axios";

// 🔹 LẤY DANH SÁCH CATEGORY
export const GetCategories = async () => {
  const response = await axiosInstance.get("/category");
  console.log("GetCategories response:", response.data);
  return response.data;
};

// 🔹 TẠO CATEGORY
export const CreateCategory = async (data: any) => {
  const response = await axiosInstance.post("/category", data);
  return response.data;
};

// 🔹 CẬP NHẬT CATEGORY
export const UpdateCategory = async (categoryId: string, data: any) => {
  const response = await axiosInstance.patch(`/category/${categoryId}`, data);
  return response.data;
};

// 🔹 XOÁ CATEGORY
export const DeleteCategory = async (categoryId: string) => {
  const response = await axiosInstance.delete(`/category/${categoryId}`);
  return response.data;
};
