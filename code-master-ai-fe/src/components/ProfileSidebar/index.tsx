import React from "react";
import { Avatar, Button } from "antd";
import { UserOutlined, BookOutlined, LockOutlined, SettingOutlined, CameraOutlined } from "@ant-design/icons";

interface Props {
  activeMenu: string;
  setActiveMenu: (key: string) => void;
}

const menuItems = [
  { key: "personal-info", icon: <UserOutlined />, label: "Thông tin cá nhân" },
  { key: "my-courses", icon: <BookOutlined />, label: "Khóa học của tôi" },
  { key: "password", icon: <LockOutlined />, label: "Đổi mật khẩu" },
  { key: "settings", icon: <SettingOutlined />, label: "Cài đặt" },
];

const ProfileSidebar: React.FC<Props> = ({ activeMenu, setActiveMenu }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
      {/* Avatar */}
      <div className="relative inline-block mb-4">
        <Avatar
          size={100}
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
          className="border-4 border-brand-100"
        />
        <Button
          shape="circle"
          size="small"
          icon={<CameraOutlined style={{ color: "white", fontSize: 11 }} />}
          className="absolute bottom-1 right-1 bg-brand-400 border-2 border-white w-6 h-6 min-w-0 flex items-center justify-center"
          style={{ background: "#4a7c59", borderColor: "white" }}
        />
      </div>

      <p className="font-semibold text-brand-900 text-base mb-1">Nguyễn Văn A</p>
      <span className="inline-block bg-brand-100 text-brand-600 text-xs px-3 py-0.5 rounded-full mb-5">
        Học viên
      </span>

      {/* Navigation */}
      <div className="text-left space-y-1">
        {menuItems.map((item) => (
          <div
            key={item.key}
            onClick={() => setActiveMenu(item.key)}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl cursor-pointer text-sm transition-all ${
              activeMenu === item.key
                ? "bg-brand-100 text-brand-600 font-medium"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSidebar;