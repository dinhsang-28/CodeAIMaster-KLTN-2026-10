import React, { useEffect, useMemo, useState } from "react";
import CheckoutForm from "../../components/checkout/checkout-form/CheckoutForm";
import OrderSummary from "../../components/checkout/order-summery/OrderSummery";
import { createPayment } from "../../api/payment/payment";
import type {
  CheckoutCourseItem,
  CheckoutFormData,
  CheckoutSummary,
} from "../../types/checkout/checkout";
import Footer from "../../components/footer";
import { getCartListQuick } from "../../api/cart";
import { useParams } from "react-router-dom";
import { GetCoursesDetail } from "../../api/course";

const CheckoutPage = () => {
  const { courseId } = useParams();
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    email: "",
    phone: "",
    note: "",
    paymentMethod: "momo",
  });

  const [checkoutItems, setCheckoutItems] = useState<CheckoutCourseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    const fetchCheckout = async () => {
      try {
        setLoading(true);

        // 👉 CASE 1: BUY NOW
        if (courseId) {
          const res = await GetCoursesDetail(courseId); // ⚠️ cần API này

          const course = res?.data;

          const item: CheckoutCourseItem = {
            id: course._id,
            title: course.title,
            price: Number(course.price || 0),
            image: course.thumbnail,
          };

          setCheckoutItems([item]);
          setTotalPrice(item.price);

          const resUser = await getCartListQuick();
          const user = resUser?.data?.user_id;

          setFormData((prev) => ({
            ...prev,
            fullName: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
          }));
          return;
        }

        // 👉 CASE 2: CART (giữ nguyên)
        const res = await getCartListQuick();

        const rawItems = Array.isArray(res?.data?.items) ? res.data.items : [];

        const mappedItems: CheckoutCourseItem[] = rawItems.map((item: any) => ({
          id: item.course_id?._id || "",
          title: item.course_id?.title || "",
          price: Number(item.price || 0),
          image: item.course_id?.thumbnail || "",
        }));

        setCheckoutItems(mappedItems);
        setTotalPrice(Number(res?.data?.totalPrice || 0));

        const user = res?.data?.user_id;

        setFormData((prev) => ({
          ...prev,
          fullName: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
        }));
      } catch (error) {
        console.error("Lỗi load checkout:", error);
        setCheckoutItems([]);
        setTotalPrice(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckout();
  }, [courseId]);

  const handleChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleSubmit = async () => {
    try {
      const res = await createPayment({
        payment_method: formData.paymentMethod,
        courseId: courseId, // 🔥 thêm dòng này
      });

      const paymentUrl = res?.data?.payment_url;

      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      alert("Tạo đơn hàng thành công nhưng chưa có link thanh toán.");
    } catch (error) {
      console.error("Thanh toán lỗi:", error);
      alert("Có lỗi xảy ra khi thanh toán.");
    }
  };
  const summary: CheckoutSummary = useMemo(() => {
    const subtotal = checkoutItems.reduce((sum, item) => sum + item.price, 0);
    const discount = 0;
    const total = totalPrice || subtotal - discount;

    return {
      subtotal,
      discount,
      total,
    };
  }, [checkoutItems, totalPrice]);

  return (
    <>
      <main className="max-w-[1200px] mx-auto w-full px-6 py-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
          Thanh toán
        </h1>

        <p className="text-slate-500 mb-12">
          Hoàn tất đăng ký để bắt đầu hành trình lập trình của bạn cùng chuyên
          gia.
        </p>

        {loading ? (
          <p>Đang tải thông tin thanh toán...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <CheckoutForm formData={formData} onChange={handleChange} />
            <OrderSummary
              items={checkoutItems}
              summary={summary}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default CheckoutPage;
