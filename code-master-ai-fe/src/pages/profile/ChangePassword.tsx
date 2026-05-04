import React, { useMemo, useState } from "react";
import { Button, Input } from "antd";
import { PostChangePassword, PostRetryPassword, PostVerifyForgotOTP } from "../../api/auth";
import { useUserInfo } from "../../store/user";


const strengthLevels = [
  { label: "Yếu", color: "#e24b4a" },
  { label: "Trung bình", color: "#ef9f27" },
  { label: "Mạnh", color: "#4a7c59" },
  { label: "Rất mạnh", color: "#2f5438" },
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
  <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
    {children}
  </p>
);

const ChangePassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const userInfo = useUserInfo((state) => state.userInfo);

  const strength = useMemo(() => (newPassword ? getStrength(newPassword) : 0), [newPassword]);
  const strengthInfo = newPassword && strength > 0 ? strengthLevels[strength - 1] : null;

  const handleSendOtp = async () => {
    const targetEmail = email || userInfo?.email || "";
    if (!targetEmail) {
      setMessage({ type: "error", text: "Vui lòng nhập email." });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await PostRetryPassword({ email: targetEmail });
      setEmail(targetEmail);
      setStep(2);
      setMessage({ type: "success", text: "Đã gửi mã xác nhận đến email của bạn." });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.response?.data?.message || "Không gửi được mã xác nhận.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Vui lòng nhập email trước." });
      return;
    }
    if (!otp || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "Vui lòng nhập đầy đủ thông tin." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp." });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await PostVerifyForgotOTP({ email, code: otp });
      await PostChangePassword({
        email,
        code: otp,
        password: newPassword,
        confirmPassword,
      });
      setMessage({ type: "success", text: "Đổi mật khẩu thành công." });
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setStep(1);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.response?.data?.message || "Đổi mật khẩu thất bại.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-brand-900">Đổi mật khẩu</h2>
      </div>

      {message && (
        <div className={`mb-5 rounded-xl px-4 py-3 text-sm font-medium ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-7">
          <p className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-400">
            Bước 1: Nhận mã xác nhận
          </p>

          <div className="mb-4">
            <FormLabel>Email</FormLabel>
            <Input
              placeholder="Nhập email tài khoản"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <Button
            block
            loading={loading && step === 1}
            onClick={handleSendOtp}
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
            Gửi mã xác nhận
          </Button>

          <div className="mt-6 rounded-xl bg-brand-25 p-4 text-sm text-gray-600">
            Sau khi nhận mã qua email, bạn sẽ nhập mã xác nhận ở bước tiếp theo để đổi mật khẩu mới.
          </div>
        </div>

        <div
          style={{
            background: "#e8f0eb",
            borderRadius: 16,
            border: "0.5px solid #c8d9cc",
            padding: "24px 22px",
          }}
        >
          <p className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: "#3d6b4a" }}>
            Bước 2: Nhập mã và đặt mật khẩu mới
          </p>

          <div className="mb-4">
            <FormLabel>Mã xác nhận</FormLabel>
            <Input
              placeholder="Nhập mã xác nhận từ email"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={step === 1}
              className="rounded-xl"
            />
          </div>

          <div className="mb-4">
            <FormLabel>Mật khẩu mới</FormLabel>
            <Input.Password
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={step === 1}
              className="rounded-xl"
            />
            {newPassword && (
              <div className="mt-2">
                <div className="mb-1 flex gap-1">
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
                {strengthInfo && <span style={{ fontSize: 10, color: strengthInfo.color }}>{strengthInfo.label}</span>}
              </div>
            )}
          </div>

          <div className="mb-6">
            <FormLabel>Xác nhận mật khẩu mới</FormLabel>
            <Input.Password
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={step === 1}
              className="rounded-xl"
            />
          </div>

          <Button
            block
            loading={loading && step === 2}
            onClick={handleSubmit}
            disabled={step === 1}
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
      </div>
    </div>
  );
};

export default ChangePassword;
