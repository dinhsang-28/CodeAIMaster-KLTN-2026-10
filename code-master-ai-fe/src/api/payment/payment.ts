import { axiosInstance } from "../../utils/axios";

export interface CreatePaymentPayload {
  payment_method: "momo" | "vnpay";
  courseId?: string;
}

export interface PaymentUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface PaymentOrder {
  _id: string;
  user_id: string;
  total_price: number;
  status: "paid" | "pending" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface PaymentByOrderData {
  _id: string;
  user_id: PaymentUser;
  order_id: PaymentOrder;
  amount: number;
  payment_method: "momo" | "vnpay";
  payment_status: "paid" | "pending" | "failed";
  paid_at: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentByOrderResponse {
  message: string;
  data: PaymentByOrderData;
}

export const createPayment = async (payload: CreatePaymentPayload) => {
  try {
    const response = await axiosInstance.post("/payments/create", payload);
    return response.data;
  } catch (error) {
    console.error("Lỗi tạo thanh toán:", error);
    throw error;
  }
};

export const getMyPayments = async () => {
  try {
    const response = await axiosInstance.get("/payments/my-payments");
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách thanh toán:", error);
    throw error;
  }
};

export const getPaymentByOrderId = async (
  orderId: string,
): Promise<PaymentByOrderResponse> => {
  try {
    const response = await axiosInstance.get<PaymentByOrderResponse>(
      `/payments/by-order/${orderId}`,
    );
    console.log("LẤY PAYMENT THEO ORDER THÀNH CÔNG:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("LỖI LẤY PAYMENT THEO ORDER:", error.response?.data || error);
    throw error;
  }
};
