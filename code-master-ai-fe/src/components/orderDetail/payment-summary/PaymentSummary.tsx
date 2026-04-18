import React, { useEffect, useState } from "react";
import { Landmark } from "lucide-react";
import {
  getPaymentByOrderId,
  PaymentByOrderData,
} from "../../../api/payment/payment";

type Props = {
  orderId: string;
};
const formatPrice = (price: number) => {
  return price.toLocaleString("vi-VN") + "đ";
};

const PaymentSummary: React.FC<Props> = ({ orderId }) => {
  const [payment, setPayment] = useState<PaymentByOrderData | null>(null);

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
    <div className="bg-[#3a5a40] p-8 rounded-2xl text-white shadow-lg">
      <h3 className="text-xs font-bold uppercase tracking-widest text-green-200 mb-6">
        Tóm tắt thanh toán
      </h3>

      <div className="space-y-4 mb-6">
        {/* <div className="flex justify-between text-sm opacity-90">
          <span>Tạm tính</span>
          <span>{formatPrice(payment.subtotal)}</span>
        </div> */}
        <div className="flex justify-between text-sm opacity-90">
          <span>Tổng tiền</span>
          <span>-{formatPrice(payment?.amount || 1)}</span>
        </div>
      </div>

      <div className="h-px bg-white/10 mb-6" />

      <div className="mb-6">
        <div className="text-xs opacity-70 mb-1">Tổng thanh toán</div>
        <div className="text-2xl font-bold">
          {formatPrice(payment?.amount || 1)}
        </div>
      </div>

      <div className="bg-white/10 p-4 rounded-lg flex items-start gap-3">
        <div className="text-xs flex items-center gap-2">
          <Landmark size={20} />
          <div>
            <div className="font-bold mb-0.5 flex items-center gap-2">
              <span>Phương thức thanh toán</span>
            </div>
            <div className="opacity-80 uppercase font-bold">
              {payment?.payment_method}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
