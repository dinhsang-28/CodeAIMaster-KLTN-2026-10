import { useEffect, useState } from "react";
import { Input, Button, Divider } from "antd";
import { showMessage } from "../../utils/showMessages";
import {
  MailOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  UserOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
  PostChangePassword,
  PostOTP,
  PostRegister,
  PostRetryPassword,
  PostVerifyForgotOTP,
  handleGithubLogin,
  handleGoogleLogin,
} from "../../api/auth";
import { PostLogin } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import { useUserInfo } from "../../store/user";

type AuthFormProps = {
  type?: "login" | "register";
};

export interface IUser {
  _id: string;
  email: string;
}

export default function AuthForm({ type = "login" }: AuthFormProps) {
  const { setUserInfo } = useUserInfo();
  const [tab, setTab] = useState<"login" | "register">(type);
  const navigate = useNavigate();
  const [OTP, setOTP] = useState("");
  const [userData, setUserData] = useState<IUser | null>(null);

  const [errorEmail, setErrorEmail] = useState(false);
  const [errorPassword, setErrorPassword] = useState(false);
  const [errorConfirmPassword, setErrorConfirmPassword] = useState(false);

  const [errorEmailTab, setErrorEmailTab] = useState<"login" | "register">(
    "login",
  );
  const [errorPasswordTab, setErrorPasswordTab] = useState<
    "login" | "register"
  >("login");

  const [formRegisterData, setFormRegisterData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formLoginData, setFormLoginData] = useState({
    email: "",
    password: "",
  });

  // States Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // 🚨 STATE QUẢN LÝ 3 BƯỚC: email -> otp -> password
  const [forgotStep, setForgotStep] = useState<"email" | "otp" | "password">(
    "email",
  );

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOTP, setForgotOTP] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const showModal = () => setIsModalOpen(true);

  const showForgotModal = () => {
    setIsForgotModalOpen(true);
    setForgotStep("email");
    setForgotEmail("");
    setForgotOTP("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleOk = async () => {
    setIsModalOpen(false);
    try {
      await PostOTP({ _id: userData?._id || "", code: OTP });
      showMessage("success", "Xác thực thành công! Vui lòng đăng nhập.");
      setTab("login");
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.message || "Mã OTP không đúng",
      );
    }
    setOTP("");
  };

  const handleCancel = () => setIsModalOpen(false);

  // --- LOGIC QUÊN MẬT KHẨU (3 BƯỚC) ---

  // BƯỚC 1: GỬI YÊU CẦU LẤY OTP
  const handleSendEmail = async () => {
    if (!forgotEmail)
      return showMessage("error", "Vui lòng nhập email của bạn");
    try {
      await PostRetryPassword({ email: forgotEmail });
      showMessage("success", "OTP đã được gửi! Vui lòng kiểm tra hộp thư.");
      setForgotStep("otp"); // Sang bước 2
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.message || "Email không tồn tại trong hệ thống",
      );
    }
  };

  // BƯỚC 2: XÁC THỰC MÃ OTP
  const handleVerifyOTP = async () => {
    if (!forgotOTP) return showMessage("error", "Vui lòng nhập mã OTP");
    try {
      // Gọi API kiểm tra OTP (không đổi pass)
      await PostVerifyForgotOTP({ email: forgotEmail, code: forgotOTP });
      showMessage("success", "Mã OTP chính xác! Mời bạn tạo mật khẩu mới.");
      setForgotStep("password"); // Sang bước 3
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn",
      );
    }
  };

  // BƯỚC 3: ĐẶT LẠI MẬT KHẨU MỚI
  const handleResetPassword = async () => {
    if (!newPassword || !confirmNewPassword)
      return showMessage("error", "Vui lòng điền mật khẩu mới");
    if (newPassword !== confirmNewPassword)
      return showMessage("error", "Mật khẩu xác nhận không khớp!");

    try {
      // Gọi API đổi mật khẩu cũ của bạn
      await PostChangePassword({
        email: forgotEmail,
        code: forgotOTP,
        password: newPassword,
        confirmPassword: confirmNewPassword,
      });

      showMessage(
        "success",
        "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.",
      );
      setIsForgotModalOpen(false);
      setTab("login");
    } catch (error: any) {
      showMessage("error", error.response?.data?.message || "Lỗi đổi mật khẩu");
    }
  };

  const handleResendOTP = async () => {
    try {
      await PostRetryPassword({ email: forgotEmail });
      showMessage("success", "Đã gửi lại mã OTP mới vào email!");
    } catch (error: any) {
      showMessage(
        "error",
        error.response?.data?.message || "Lỗi khi gửi lại OTP",
      );
    }
  };
  // END LOGIC QUÊN MẬT KHẨU

  const checkform = () => {
    if (tab === "register") {
      return Object.values(formRegisterData).every(
        (value) => value.trim() !== "",
      );
    } else {
      return Object.values(formLoginData).every((value) => value.trim() !== "");
    }
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onEmailChange = (value: string) => {
    setErrorEmail(!emailRegex.test(value));
    if (errorEmail && tab === "register") setErrorEmailTab("register");
    else if (errorEmail && tab === "login") setErrorEmailTab("login");

    const setFormData =
      tab === "register" ? setFormRegisterData : setFormLoginData;
    setFormData((prev: any) => ({ ...prev, email: value }));
  };

  const onPasswordChange = (value: string) => {
    setErrorPassword(value.length < 6);
    if (errorPassword && tab === "register") setErrorPasswordTab("register");
    else if (errorPassword && tab === "login") setErrorPasswordTab("login");

    const setFormData =
      tab === "register" ? setFormRegisterData : setFormLoginData;
    setFormData((prev: any) => ({ ...prev, password: value }));
  };

  const onConfirmPasswordChange = (value: string) => {
    if (value !== formRegisterData.password) {
      setErrorConfirmPassword(true);
      setFormRegisterData({ ...formRegisterData, confirmPassword: value });
    } else {
      setErrorConfirmPassword(false);
      setFormRegisterData({ ...formRegisterData, confirmPassword: value });
    }
  };

  const onSubmit = async () => {
    const ischecked = checkform();
    if (!ischecked || errorEmail || errorPassword || errorConfirmPassword) {
      showMessage(
        "error",
        `Vui lòng điền đầy đủ thông tin đăng ${tab === "register" ? "ký" : "nhập"}`,
      );
      return;
    }

    if (tab === "login") {
      try {
        const data = await PostLogin(formLoginData);
        if (data && data.user) {
          setUserInfo(data.user);
          showMessage("success", "Đăng nhập thành công");
          const perms = data.user.permissions || [];
          if (perms.length > 0) {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }
      } catch (error: any) {
        showMessage(
          "error",
          error.response?.data?.message || "Đăng nhập thất bại",
        );
      }
    } else {
      try {
        const data = await PostRegister(formRegisterData);
        setUserData(data);
        showModal();
      } catch (error: any) {
        showMessage(
          "error",
          error.response?.data?.message || "Đăng ký thất bại",
        );
      }
    }
  };

  useEffect(() => {
    setTab(type);
  }, [type]);

  return (
    <div className="w-full max-w-[390px] py-2">
      <div className="rounded-[26px] bg-white px-10 py-10 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
        {/* Tabs */}
        <div className="mb-6 flex rounded-full bg-brand-25 p-1">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
              tab === "login"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
              tab === "register"
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Heading */}
        <h2 className="mb-1 text-[18px] font-extrabold text-brand-700 md:text-[20px]">
          {tab === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
        </h2>
        <p className="mb-5 text-[13px] leading-5 text-slate-400">
          {tab === "login"
            ? "Vui lòng nhập thông tin để truy cập tài khoản"
            : "Vui lòng nhập thông tin để đăng ký thành viên"}
        </p>

        {/* Form */}
        <div className="space-y-3">
          {tab === "register" && (
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-800">
                Họ và tên
              </label>
              <Input
                size="large"
                placeholder="Nguyễn Văn A"
                value={formRegisterData.fullname}
                onChange={(e) =>
                  setFormRegisterData({
                    ...formRegisterData,
                    fullname: e.target.value,
                  })
                }
                prefix={<UserOutlined className="text-slate-400" />}
                className="!h-11 !rounded-[12px] !border-brand-100 !bg-brand-25"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-800">
              Email
            </label>
            <Input
              size="large"
              value={
                tab === "register"
                  ? formRegisterData.email
                  : formLoginData.email
              }
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="example@gmail.com"
              prefix={<MailOutlined className="text-slate-400" />}
              className="!h-11 !rounded-[12px] !border-brand-100 !bg-brand-25"
            />
            {errorEmailTab === tab && errorEmail && (
              <p className="mt-1 text-[11px] text-red-500">
                Vui lòng nhập email hợp lệ.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-800">
              Mật khẩu
            </label>
            <Input.Password
              size="large"
              value={
                tab === "register"
                  ? formRegisterData.password
                  : formLoginData.password
              }
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="••••••••"
              prefix={<LockOutlined className="text-slate-400" />}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              className="!h-11 !rounded-[12px] !border-brand-100 !bg-brand-25"
            />
            {errorPasswordTab === tab && errorPassword && (
              <p className="mt-1 text-[11px] text-red-500">
                Mật khẩu phải có ít nhất 6 ký tự.
              </p>
            )}
          </div>

          {tab === "register" && (
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-800">
                Xác nhận mật khẩu
              </label>
              <Input.Password
                size="large"
                value={formRegisterData.confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                placeholder="••••••••"
                prefix={
                  <SafetyCertificateOutlined className="text-slate-400" />
                }
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                className="!h-11 !rounded-[12px] !border-brand-100 !bg-brand-25"
              />
              {errorConfirmPassword && (
                <p className="mt-1 text-[11px] text-red-500">
                  Mật khẩu xác nhận không khớp.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Options */}
        {tab === "login" && (
          <div className="mt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={showForgotModal}
              className="text-[13px] font-semibold text-brand-700"
            >
              Quên mật khẩu?
            </button>
          </div>
        )}

        {/* Submit */}
        <Button
          type="primary"
          block
          size="large"
          onClick={onSubmit}
          className="!mt-5 !h-[46px] !rounded-[12px] !border-none !bg-brand-600 !text-sm !font-semibold hover:!bg-brand-700"
        >
          {tab === "login" ? "Đăng nhập" : "Đăng ký ngay"}
        </Button>

        {/* Divider */}
        <Divider className="!my-5 !text-[11px] !font-semibold !uppercase !tracking-wider !text-slate-400">
          Hoặc tiếp tục với
        </Divider>

        {/* Social */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex h-10 items-center justify-center gap-2 rounded-[12px] border border-brand-100 bg-white text-sm font-semibold text-slate-700 transition hover:bg-brand-25"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-4 w-4"
            />
            Google
          </button>
          <button
            type="button"
            onClick={handleGithubLogin}
            className="flex h-10 items-center justify-center gap-2 rounded-[12px] border border-brand-100 bg-white text-sm font-semibold text-slate-700 transition hover:bg-brand-25"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M12 .5C5.65.5.5 5.66.5 12.03c0 5.1 3.3 9.42 7.88 10.95.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.38-3.87-1.38-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.78 2.71 1.27 3.37.97.1-.75.4-1.27.73-1.56-2.55-.29-5.23-1.28-5.23-5.72 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.45-2.68 5.42-5.24 5.71.41.36.78 1.08.78 2.18v3.23c0 .31.21.68.8.56A11.53 11.53 0 0 0 23.5 12.03C23.5 5.66 18.35.5 12 .5Z" />
            </svg>
            GitHub
          </button>
        </div>

        {tab === "register" && (
          <p className="mt-5 text-center text-[13px] text-slate-500">
            Đã có tài khoản?{" "}
            <button
              type="button"
              onClick={() => setTab("login")}
              className="font-semibold text-brand-700"
            >
              Đăng nhập ngay
            </button>
          </p>
        )}
      </div>

      {/* Modal Đăng ký OTP */}
      <Modal
        title="Nhập OTP Kích Hoạt"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{
          className:
            "!bg-brand-600 hover:!bg-brand-700 !border-none !rounded-xl",
        }}
        cancelButtonProps={{
          className:
            "!rounded-xl !border-brand-200 hover:!text-brand-700 hover:!bg-brand-25",
        }}
      >
        <Input
          placeholder="Nhập mã OTP"
          value={OTP}
          onChange={(e) => setOTP(e.target.value)}
          className="!h-11 !rounded-xl !bg-brand-25 !border-brand-100"
        />
      </Modal>

      {/*  MODAL QUÊN MẬT KHẨU  */}
      <Modal
        title={
          forgotStep === "email"
            ? "Quên mật khẩu"
            : forgotStep === "otp"
              ? "Nhập mã xác nhận"
              : "Đặt lại mật khẩu"
        }
        open={isForgotModalOpen}
        onCancel={() => setIsForgotModalOpen(false)}
        onOk={
          forgotStep === "email"
            ? handleSendEmail
            : forgotStep === "otp"
              ? handleVerifyOTP
              : handleResetPassword
        }
        okText={
          forgotStep === "email"
            ? "Gửi OTP"
            : forgotStep === "otp"
              ? "Xác nhận OTP"
              : "Lưu mật khẩu mới"
        }
        cancelText="Hủy bỏ"
        okButtonProps={{
          className:
            "!bg-brand-600 hover:!bg-brand-700 !border-none !rounded-xl",
        }}
        cancelButtonProps={{
          className:
            "!rounded-xl !border-brand-200 hover:!text-brand-700 hover:!bg-brand-25",
        }}
      >
        <div className="pt-2">
          {/*  Nhập Email */}
          {forgotStep === "email" && (
            <>
              <p className="text-sm text-gray-500 mb-3">
                Vui lòng nhập email đã đăng ký, chúng tôi sẽ gửi mã xác nhận
                (OTP) gồm 5 chữ số cho bạn.
              </p>
              <Input
                placeholder="Nhập email của bạn..."
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="!h-11 !rounded-xl !bg-brand-25 !border-brand-100"
              />
            </>
          )}

          {/*  Xác nhận OTP */}
          {forgotStep === "otp" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-1">
                Mã OTP đã được gửi đến:{" "}
                <strong className="text-brand-600">{forgotEmail}</strong>
              </p>
              <Input
                placeholder="Nhập mã OTP (5 số)"
                value={forgotOTP}
                onChange={(e) => setForgotOTP(e.target.value)}
                className="!h-11 !rounded-xl !bg-brand-25 !border-brand-100"
              />
              <p
                onClick={handleResendOTP}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium cursor-pointer inline-block mt-2"
              >
                Gửi lại mã OTP
              </p>
            </div>
          )}

          {/*  Đổi mật khẩu */}
          {forgotStep === "password" && (
            <div className="space-y-3">
              <p className="text-sm text-green-600 mb-1 font-medium">
                Mã OTP hợp lệ! Hãy thiết lập mật khẩu mới.
              </p>
              <Input.Password
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="!h-11 !rounded-xl !bg-brand-25 !border-brand-100"
              />
              <Input.Password
                placeholder="Xác nhận lại mật khẩu mới"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="!h-11 !rounded-xl !bg-brand-25 !border-brand-100"
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}