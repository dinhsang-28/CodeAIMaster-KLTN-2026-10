import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface OrderSummaryProps {
  totalPrice: number;
}
export default function OrderSummary({ totalPrice }: OrderSummaryProps) {
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate("/checkout");
  };
  return (
    <div className="bg-white p-8 rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-slate-50 sticky top-28">
      <h2 className="text-xl font-bold mb-8 text-[#3a473c]">
        Tóm tắt đơn hàng
      </h2>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between text-slate-500 font-medium">
          <span>Tổng tiền</span>
          <span className="text-slate-700">
            {totalPrice.toLocaleString("vi-VN")}đ
          </span>
        </div>

        {/* <div className="flex justify-between text-slate-500 font-medium">
          <span>Giảm giá</span>
          <span className="text-[#2a9d8f]">{summary.discount}</span>
        </div> */}

        <div className="flex justify-between items-center pt-6 mt-4 border-t border-slate-100">
          <span className="text-lg font-bold text-slate-800">Thành tiền</span>
          <span className="text-2xl font-extrabold text-[#3a473c]">
            {totalPrice.toLocaleString("vi-VN")}đ
          </span>
        </div>
      </div>

      {/* <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Mã giảm giá
        </label>

        <div className="flex gap-2">
          <input
            className="flex-1 bg-[#f8faf8] border-none rounded-xl text-sm px-4 py-3 focus:ring-1 focus:ring-[#4a5d4e]/20 placeholder:text-slate-400 outline-none"
            placeholder="Nhập mã"
            type="text"
          />
          <button className="bg-[#e8ebe8] hover:bg-[#dfe4df] text-[#3a473c] font-bold px-6 py-3 rounded-xl text-sm transition-colors">
            Áp dụng
          </button>
        </div>
      </div> */}

      <button
        onClick={handleCheckout}
        className="w-full bg-[#4a5d4e] hover:bg-[#3d4d41] text-white font-bold py-4 rounded-full shadow-lg shadow-[#4a5d4e]/10 transition-all flex items-center justify-center gap-2 group"
      >
        <span>Tiến hành thanh toán</span>
        <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
          {<ArrowRight />}
        </span>
      </button>

      <p className="text-center text-[11px] text-slate-400 mt-8 leading-relaxed">
        Bằng cách tiếp tục, bạn đồng ý với các{" "}
        <a href="/" className="underline">
          Điều khoản Dịch vụ
        </a>{" "}
        của CodeMaster AI.
      </p>
    </div>
  );
}
