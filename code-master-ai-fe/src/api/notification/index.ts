import { axiosInstance } from "../../utils/axios";

export type NotificationType = "system" | "course" | "assignment" | "order";

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getNotifications = async (): Promise<NotificationItem[]> => {
  const res = await axiosInstance.get("/notifications");
  return res.data?.data || res.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const res = await axiosInstance.get("/notifications/unread-count");
  return res.data?.data ?? res.data ?? 0;
};

export const markNotificationAsRead = async (id: string) => {
  const res = await axiosInstance.patch(`/notifications/${id}/read`);
  return res.data?.data || res.data;
};

export const markAllNotificationsAsRead = async () => {
  const res = await axiosInstance.patch("/notifications/read-all");
  return res.data?.data || res.data;
};
