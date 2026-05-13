import React, { useEffect, useState } from "react";
import { Badge, Button, Dropdown, Empty, List, Typography } from "antd";
import { BellOutlined, DeleteOutlined } from "@ant-design/icons";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { useUserInfo } from "../../store/user";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NotificationItem,
  deleteNotification,
} from "../../api/notification";
import { axiosInstance } from "../../utils/axios";

const { Text } = Typography;

const formatTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("vi-VN");
};

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useUserInfo();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userInfo) return;

    const load = async () => {
      try {
        const [list, count] = await Promise.all([
          getNotifications(),
          getUnreadCount(),
        ]);
        setItems(Array.isArray(list) ? list : []);
        setUnreadCount(typeof count === "number" ? count : 0);
      } catch (error) {
        console.error("Load notifications failed:", error);
      }
    };

    load();
  }, [userInfo]);

  useEffect(() => {
    if (!userInfo) return;

    const socketBaseUrl =
      (axiosInstance.defaults.baseURL || "")
        .replace(/\/api\/v1\/?$/, "")
        .replace(/\/$/, "") || window.location.origin;

    const localToken =
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken") ||
      "";

    const socket: Socket = io(socketBaseUrl, {
      path: "/api/v1/socket.io",
      withCredentials: true,
      auth: localToken ? { token: localToken } : undefined,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("notification:new", (notification: NotificationItem) => {
      setItems((prev) => [notification, ...prev].slice(0, 20));
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("notification:count_updated", (payload: { count: number }) => {
      setUnreadCount(payload?.count ?? 0);
      setItems((prev) =>
        prev.map((item, index) => {
          if (index < payload?.count) return item;
          return { ...item, isRead: true };
        }),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [userInfo]);

  const onClickNotification = async (item: NotificationItem) => {
    try {
      if (!item.isRead) {
        await markNotificationAsRead(item._id);
        setItems((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (error) {
      console.error("mark read failed:", error);
    }
    if (userInfo?.roleName !== "Admin") {
      if (item.link) {
        if (item.link.startsWith("/")) {
          navigate(item.link);
        } else {
          navigate(`/order-detail/${item.link}`);
        }
      }
    }

    setOpen(false);
  };

  const onReadAll = async () => {
    try {
      await markAllNotificationsAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("mark all read failed:", error);
    }
  };

  const onDeleteNotification = async (
    event: React.MouseEvent<HTMLElement>,
    item: NotificationItem,
  ) => {
    event.stopPropagation();
    try {
      await deleteNotification(item._id);
      setItems((prev) => prev.filter((n) => n._id !== item._id));
      if (!item.isRead) {
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (error) {
      console.error("delete notification failed:", error);
    }
  };

  const menuContent = (
    <div className="w-[360px] rounded-xl bg-white shadow-lg border border-gray-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <Text strong>Thông báo</Text>
        <Button
          type="link"
          size="small"
          onClick={onReadAll}
          disabled={!items.length}
        >
          Đánh dấu đã đọc tất cả
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="p-4">
          <Empty
            description="Chưa có thông báo"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <List
          className="max-h-[420px] overflow-y-auto"
          dataSource={items}
          renderItem={(item) => (
            <List.Item
              className="!px-4 !py-3 cursor-pointer hover:bg-gray-50"
              onClick={() => onClickNotification(item)}
            >
              <div className="w-full">
                <div className="flex items-start justify-between gap-2">
                  <Text strong={!item.isRead}>{item.title}</Text>
                  {!item.isRead && (
                    <span className="mt-1 inline-block w-2 h-2 rounded-full bg-red-500" />
                  )}
                </div>
                <Text type="secondary" className="!block text-sm">
                  {item.message}
                </Text>
                <Text type="secondary" className="!block text-xs mt-1">
                  {formatTime(item.createdAt)}
                </Text>
                <div className="mt-2 flex justify-end">
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(event) => onDeleteNotification(event, item)}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  if (!userInfo) return null;

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      popupRender={() => menuContent}
      trigger={["click"]}
      placement="bottomRight"
    >
      <button
        type="button"
        className="relative text-2xl text-brand-700 hover:text-brand-400 flex items-center"
      >
        <Badge count={unreadCount} size="small" offset={[-2, 4]}>
          <BellOutlined className="text-xl" />
        </Badge>
      </button>
    </Dropdown>
  );
};

export default NotificationBell;
