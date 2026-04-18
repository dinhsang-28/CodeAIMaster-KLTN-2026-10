import React from "react";
import codeimg from "../../assets/Overlay+Shadow+OverlayBlur.png";
import { CodeOutlined } from "@ant-design/icons";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* LEFT */}
      <div className="bg-brand-50 py-10 px-24 flex flex-col justify-between">
        <div className="flex items-center gap-2 font-bold text-brand-700">
          <span className="text-gray-200 bg-brand-600 rounded-full w-8 h-8 flex items-center justify-center">
            {<CodeOutlined />}
          </span>{" "}
          CodeMaster AI
        </div>

        <div>
          <h1 className="text-4xl font-bold text-brand-700">
            Chào mừng bạn đến với CodeMaster AI
          </h1>

          <p className="mt-4 text-gray-600">
            Bắt đầu hành trình lập trình đỉnh cao với sự hỗ trợ từ trí tuệ nhân
            tạo. Tối ưu hóa quy trình làm việc và nâng tầm kỹ năng của bạn ngay
            hôm nay.
          </p>
        </div>

        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80"
            className="rounded-2xl shadow-lg border-4 border-gray-200"
          />
          <img
            className="absolute bottom-3 left-12 shadow-sm"
            src={codeimg}
            alt=""
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center justify-center bg-white">
        {children}
      </div>
    </div>
  );
}
