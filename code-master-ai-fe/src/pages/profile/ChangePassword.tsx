import React, { useState } from "react";
import { Input, Button, Typography } from "antd";
import { CheckOutlined } from "@ant-design/icons";

const { Text } = Typography;

const strengthLevels = [
  { label: "Yếu", color: "#e24b4a" },
  { label: "Trung bình", color: "#ef9f27" },
  { label: "Mạnh", color: "#4a7c59" },
  { label: "Rất mạnh", color: "#2f5438" },
];

const requirements = [
  "Tối thiểu 8 ký tự",
  "Ít nhất 1 chữ hoa (A-Z)",
  "Ít nhất 1 chữ số (0-9)",
  "Ít nhất 1 ký tự đặc biệt (!@#$...)",
  "Không trùng mật khẩu cũ",
];

const getStrength = (val: string): number => {
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^a-zA-Z0-9]/.test(val)) score++;
  return score;
};

const FormLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1.5">
    {children}
  </p>
);

const ChangePassword = () => {
  const [newPw, setNewPw] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = newPw ? getStrength(newPw) : 0;
  const strengthInfo = newPw && strength > 0 ? strengthLevels[strength - 1] : null;

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-brand-900">Đổi mật khẩu</h2>
      </div>

      <div className="grid grid-cols-2 gap-5 items-start">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-7">
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-5">
            Thay đổi mật khẩu
          </p>

          <div className="mb-4">
            <FormLabel>Mật khẩu hiện tại</FormLabel>
            <Input.Password
              placeholder="Nhập mật khẩu hiện tại"
              className="rounded-xl"
            />
          </div>

          <div className="mb-4">
            <FormLabel>Mật khẩu mới</FormLabel>
            <Input.Password
              placeholder="Nhập mật khẩu mới"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="rounded-xl"
            />
            {/* Strength bar */}
            {newPw && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        height: 3,
                        flex: 1,
                        borderRadius: 2,
                        background: i <= strength && strengthInfo ? strengthInfo.color : "#e0ddd2",
                        transition: "background 0.2s",
                      }}
                    />
                  ))}
                </div>
                {strengthInfo && (
                  <span style={{ fontSize: 10, color: strengthInfo.color }}>
                    {strengthInfo.label}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="mb-6">
            <FormLabel>Xác nhận mật khẩu mới</FormLabel>
            <Input.Password
              placeholder="Nhập lại mật khẩu mới"
              className="rounded-xl"
            />
          </div>

          <Button
            block
            loading={loading}
            onClick={handleSubmit}
            style={{
              background: "#3d6b4a",
              borderColor: "#3d6b4a",
              color: "white",
              borderRadius: 10,
              height: 42,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Cập nhật mật khẩu
          </Button>
        </div>

        {/* Requirements Tips */}
        <div
          style={{
            background: "#e8f0eb",
            borderRadius: 16,
            border: "0.5px solid #c8d9cc",
            padding: "24px 22px",
          }}
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#3d6b4a" }}>
            Yêu cầu mật khẩu
          </p>
          {requirements.map((req) => (
            <div key={req} className="flex items-center gap-2.5 mb-3">
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#ccddd1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CheckOutlined style={{ fontSize: 9, color: "#3d6b4a" }} />
              </div>
              <Text style={{ fontSize: 12, color: "#3d6b4a" }}>{req}</Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;