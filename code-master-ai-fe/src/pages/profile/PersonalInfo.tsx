import React, { useState } from "react";
import { Input, Switch, Typography, Button, Select } from "antd";
import { SaveOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

const FormLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1.5">
    {children}
  </p>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-5">
    {children}
  </p>
);

const PersonalInfo = () => {
  const [loading, setLoading] = useState(false);
  const [emailNotify, setEmailNotify] = useState(true);
  const [sysNotify, setSysNotify] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-brand-900">Thông tin cá nhân</h2>
        <Button
          icon={<SaveOutlined />}
          loading={loading}
          onClick={handleSave}
          style={{ background: "#3d6b4a", borderColor: "#3d6b4a", color: "white" }}
          className="rounded-xl font-medium"
        >
          Lưu thay đổi
        </Button>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <div className="flex items-center gap-1.5 mb-4">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#3d6b4a" strokeWidth="2.5">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          <Text className="text-xs font-bold tracking-widest text-gray-400 uppercase">
            Tiến độ học tập
          </Text>
        </div>
        <div className="flex items-center gap-10">
          <div>
            <Text className="text-xs text-gray-400 block mb-1">Khóa học đã đăng ký</Text>
            <span className="text-3xl font-bold text-brand-900">12</span>
          </div>
          <div>
            <Text className="text-xs text-gray-400 block mb-1">Hoàn thành</Text>
            <span className="text-3xl font-bold text-brand-400">08</span>
          </div>
          <div className="flex-1 ml-5">
            <div className="flex justify-between mb-2">
              <Text className="text-xs text-gray-400">Tiến độ tổng quát</Text>
              <Text className="text-xs font-semibold text-brand-900">75%</Text>
            </div>
            <div className="bg-brand-100 rounded-full h-2 overflow-hidden">
              <div className="bg-brand-400 h-full rounded-full" style={{ width: "75%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Info + Notifications */}
      <div className="grid grid-cols-3 gap-5">
        {/* Basic Info */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-7">
          <SectionTitle>Thông tin cơ bản</SectionTitle>

          <div className="mb-4">
            <FormLabel>Họ và tên</FormLabel>
            <Input defaultValue="Nguyễn Văn A" className="rounded-xl" />
          </div>
          <div className="mb-4">
            <FormLabel>Email</FormLabel>
            <Input defaultValue="vana.nguyen@codemaster.ai" className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3.5 mb-4">
            <div>
              <FormLabel>Số điện thoại</FormLabel>
              <Input defaultValue="090 123 4567" className="rounded-xl" />
            </div>
            <div>
              <FormLabel>Giới tính</FormLabel>
              <Select
                defaultValue="Nam"
                className="w-full rounded-xl"
                options={[
                  { value: "Nam", label: "Nam" },
                  { value: "Nữ", label: "Nữ" },
                  { value: "Khác", label: "Khác" },
                ]}
              />
            </div>
          </div>
          <div className="mb-4">
            <FormLabel>Địa chỉ</FormLabel>
            <Input defaultValue="Thành phố Hồ Chí Minh, Việt Nam" className="rounded-xl" />
          </div>
          <div>
            <FormLabel>Tiểu sử</FormLabel>
            <TextArea
              defaultValue="Kỹ sư phần mềm đam mê học hỏi về AI và các công nghệ mới."
              rows={3}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 self-start">
          <SectionTitle>Cài đặt thông báo</SectionTitle>

          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p className="text-sm font-medium text-brand-900 mb-0.5">Thông báo qua Email</p>
              <p className="text-xs text-gray-400">Cập nhật về khóa học và bài giảng mới</p>
            </div>
            <Switch
              checked={emailNotify}
              onChange={setEmailNotify}
              style={emailNotify ? { background: "#4a7c59" } : {}}
            />
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-brand-900 mb-0.5">Tin nhắn hệ thống</p>
              <p className="text-xs text-gray-400">Các thông báo quan trọng từ quản trị viên</p>
            </div>
            <Switch
              checked={sysNotify}
              onChange={setSysNotify}
              style={sysNotify ? { background: "#4a7c59" } : {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;