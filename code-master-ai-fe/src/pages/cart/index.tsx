import React, { useEffect, useState } from "react";
import CartItem, {
  CartItemData,
} from "../../components/cart/cart-item/CartItem";
import RecommendedSection from "../../components/cart/recommended/RecommendedSection";
import OrderSummary from "../../components/cart/order-summary/OrderSummary";
import Footer from "../../components/footer";
import { GetCartLength, getCartListQuick, removeCartItem } from "../../api/cart";
import { useUserCart } from "../../store/cart";
import { GetFeaturedCourses } from "../../api/course";
import { RecommendedCourse } from "../../components/cart/recommended/RecommendedSection";

const Cart = () => {
  const [cartList, setCartList] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const { setQuantityCart } = useUserCart();
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);

        const res = await getCartListQuick();
        console.log("cart res =", res);

        const rawItems = Array.isArray(res?.data?.items) ? res.data.items : [];

        const mappedItems: CartItemData[] = rawItems.map((item: any) => ({
          id: item.course_id?._id || "",
          title: item.course_id?.title || "",
          price: `${Number(item.price || 0).toLocaleString("vi-VN")}đ`,
          description: item.course_id?.description || "",
          instructor: "Chưa cập nhật",
          image: item.course_id?.thumbnail || "",
        }));

        setCartList(mappedItems);
        setTotalPrice(Number(res?.data?.totalPrice || 0));
      } catch (error) {
        console.error("Lỗi load cart:", error);
        setCartList([]);
        setTotalPrice(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      try {
        const courses = await GetFeaturedCourses();
        const mappedCourses: RecommendedCourse[] = (courses || []).map((course: any) => ({
          id: course._id,
          title: course.title,
          price:
            Number(course.price || 0) === 0
              ? "Miễn phí"
              : `${Number(course.price || 0).toLocaleString("vi-VN")}đ`,
          image: course.thumbnail || "",
          level: course.level,
        }));
        setRecommendedCourses(mappedCourses);
      } catch (error) {
        console.error("Lỗi load khóa học gợi ý:", error);
        setRecommendedCourses([]);
      }
    };

    fetchRecommendedCourses();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await removeCartItem(id);
      const data = await GetCartLength();
      setQuantityCart(data.data);
      console.log("Xóa sản phẩm thành công!:", data.data);
      const removedItem = cartList.find((item) => item.id === id);
      setCartList((prev) => prev.filter((item) => item.id !== id));

      if (removedItem) {
        const priceNumber = Number(
          removedItem.price.replace(/\./g, "").replace("đ", ""),
        );

        setTotalPrice((prev) => Math.max(0, prev - priceNumber));
      }
    } catch (error) {
      console.error("Xóa sản phẩm lỗi:", error);
    }
  };

  return (
    <>
      <main className="mx-auto w-full px-6 lg:px-64 py-12 bg-[#fcfcf9] min-h-screen">
        <h1 className="text-3xl font-extrabold text-[#3a473c] mb-10 tracking-tight">
          Giỏ hàng của bạn
        </h1>

        {loading ? (
          <p>Đang tải giỏ hàng...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 flex flex-col gap-6">
              {cartList.length > 0 ? (
                cartList.map((item) => (
                  <CartItem key={item.id} item={item} onRemove={handleRemove} />
                ))
              ) : (
                <p>Giỏ hàng của bạn đang trống.</p>
              )}

              <RecommendedSection courses={recommendedCourses} />
            </div>

            <div className="lg:col-span-1">
              <OrderSummary totalPrice={totalPrice} />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Cart;
