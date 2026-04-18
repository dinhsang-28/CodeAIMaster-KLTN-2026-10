import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  getPaymentByOrderId,
  PaymentByOrderData,
} from "../../../api/payment/payment";

type Props = {
  orderId: string;
};

const CustomerInfo: React.FC<Props> = ({ orderId }) => {
  const [payment, setPayment] = useState<PaymentByOrderData | null>(null);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Chưa thanh toán";

    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchPayment = async () => {
      if (!orderId) return;

      try {
        const res = await getPaymentByOrderId(orderId);
        setPayment(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPayment();
  }, [orderId]);
  return (
    <div className="bg-[#f5f1e8] p-8 rounded-2xl space-y-6">
      <h3 className="text-sm font-semibold text-[#6b7280] uppercase tracking-widest">
        Thông tin khách hàng
      </h3>

      <div className="space-y-4">
        <div>
          <div className="text-xs text-[#6b7280] font-medium mb-1">Tên</div>
          <div className="font-semibold text-[#23422a]">
            {payment?.user_id.name}
          </div>
        </div>

        <div>
          <div className="text-xs text-[#6b7280] font-medium mb-1">Email</div>
          <div className="font-semibold text-[#23422a]">
            {payment?.user_id.email}
          </div>
        </div>

        <div>
          <div className="text-xs text-[#6b7280] font-medium mb-1">
            Số điện thoại
          </div>
          <div className="font-semibold text-[#23422a]">
            {payment?.user_id.phone}
          </div>
        </div>

        <div>
          <div className="text-xs text-[#6b7280] font-medium mb-1">
            Ngày thanh toán
          </div>
          <div className="font-semibold text-[#23422a]">
            {formatDate(payment?.paid_at)}
          </div>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-[#ddd7ca]">
        <div className="flex items-center gap-2 text-[#23422a] font-semibold text-sm">
          <ShieldCheck /> <span>Giao dịch an toàn</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;
