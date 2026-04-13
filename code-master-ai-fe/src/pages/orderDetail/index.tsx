import React, { useEffect, useState } from "react";

import OrderHeader from "../../components/orderDetail/order-header/OrderHeader";
import OrderTimeline from "../../components/orderDetail/order-timeline/OrderTimeline";
import OrderItemsList from "../../components/orderDetail/order-items-list/OrderItemsList";
import PaymentSummary from "../../components/orderDetail/payment-summary/PaymentSummary";
import CustomerInfo from "../../components/orderDetail/customer-info/CustomerInfo";
import Footer from "../../components/footer";
import {
  GetOrderDetail,
  type OrderDetailData,
} from "../../api/order/HistoryOrder";
import { useParams } from "react-router-dom";

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        setLoading(true);
        const res = await GetOrderDetail(orderId);
        setOrder(res.data);
      } catch (error) {
        console.error("Lỗi lấy chi tiết đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <OrderHeader
          orderCode={order?._id || ""}
          status={order?.status as "paid" | "pending" | "cancelled"}
          createdAt={order?.createdAt || ""}
        />

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <OrderTimeline
              status={order?.status as "paid" | "pending" | "cancelled"}
            />
            <OrderItemsList courses={order?.courses ?? []} />
          </div>

          <div className="lg:col-span-3 space-y-8">
            <PaymentSummary orderId={order?._id || ""} />
            <CustomerInfo orderId={order?._id || ""} />
          </div>
        </div>
      </main>
      <Footer></Footer>
    </>
  );
};

export default OrderDetailPage;
