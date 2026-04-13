// import { useEffect, useMemo, useState } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GetHistoryOrder, type OrderItem } from "../../api/order/HistoryOrder";
import type { OrderStatus, PurchaseItem } from "../../types/purchase/purchase";
import EmptyState from "../../components/purchase/empty-state/EmptyState";
import OrderCard from "../../components/purchase/order-card/OrderCard";
import SearchBox from "../../components/purchase/search-box/SearchBox";
import StatusFilter from "../../components/purchase/status-fillter/StatusFilter";
import Footer from "../../components/footer";

type FilterValue = "all" | OrderStatus;

const PurchaseHistoryContent = () => {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [orders, setOrders] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const mapOrderStatus = (status: string): OrderStatus => {
    switch (status) {
      case "pending":
        return "pending";
      case "failed":
      case "cancelled":
        return "failed";
      case "paid":
      case "completed":
      case "success":
      default:
        return "paid";
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return "0đ";
    return `${price.toLocaleString("vi-VN")}đ`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  // const mapApiOrderToPurchaseItem = (order: OrderItem): PurchaseItem => {
  //   const firstOrderDetail = order.orderDetails?.[0];
  //   const firstCourse = firstOrderDetail?.course;

  //   return {
  //     id: order._id,
  //     typeLabel: "Khóa học trực tuyến",
  //     title: firstCourse?.title || "Đơn hàng khóa học",
  //     date: formatDate(order.createdAt),
  //     paymentMethod: "Thanh toán online",
  //     total: formatPrice(order.total_price),
  //     status: mapOrderStatus(order.status),
  //     thumbnail:
  //       order.firstCourseImage ||
  //       firstCourse?.thumbnail ||
  //       "https://via.placeholder.com/300x200?text=Course",
  //   };
  // };
  const mapApiOrderToPurchaseItem = useCallback(
    (order: OrderItem): PurchaseItem => {
      const firstOrderDetail = order.orderDetails?.[0];
      const firstCourse = firstOrderDetail?.course;

      return {
        id: order._id,
        typeLabel: "Khóa học trực tuyến",
        title: firstCourse?.title || "Đơn hàng khóa học",
        date: formatDate(order.createdAt),
        paymentMethod: "Thanh toán online",
        total: formatPrice(order.total_price),
        status: mapOrderStatus(order.status),
        thumbnail:
          order.firstCourseImage ||
          firstCourse?.thumbnail ||
          "https://via.placeholder.com/300x200?text=Course",
      };
    },
    [],
  );
  // useEffect(() => {
  //   const fetchOrders = async () => {
  //     setLoading(true);
  //     try {
  //       const apiStatus =
  //         activeFilter === "all"
  //           ? undefined
  //           : activeFilter === "failed"
  //             ? "cancelled"
  //             : activeFilter;

  //       const res = await GetHistoryOrder({
  //         current: currentPage,
  //         pageSize,
  //         status: apiStatus,
  //       });

  //       const mappedOrders = (res.data.results || []).map(
  //         mapApiOrderToPurchaseItem,
  //       );

  //       setOrders(mappedOrders);
  //       setTotalPages(res.data.totalPages || 1);
  //       setTotalItems(res.data.totalItems || 0);
  //     } catch (error) {
  //       console.error("Lỗi lấy lịch sử đơn hàng:", error);
  //       setOrders([]);
  //       setTotalPages(1);
  //       setTotalItems(0);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchOrders();
  // }, [currentPage, pageSize, activeFilter]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const apiStatus =
          activeFilter === "all"
            ? undefined
            : activeFilter === "failed"
              ? "cancelled"
              : activeFilter;

        const res = await GetHistoryOrder({
          current: currentPage,
          pageSize,
          status: apiStatus,
        });

        const mappedOrders = (res.data.results || []).map(
          mapApiOrderToPurchaseItem,
        );

        setOrders(mappedOrders);
        setTotalPages(res.data.totalPages || 1);
        setTotalItems(res.data.totalItems || 0);
      } catch (error) {
        console.error("Lỗi lấy lịch sử đơn hàng:", error);
        setOrders([]);
        setTotalPages(1);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentPage, pageSize, activeFilter, mapApiOrderToPurchaseItem]);
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const filteredOrders = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return orders.filter((item) => {
      const matchSearch =
        keyword === "" ||
        item.title.toLowerCase().includes(keyword) ||
        item.typeLabel.toLowerCase().includes(keyword) ||
        item.paymentMethod.toLowerCase().includes(keyword);

      return matchSearch;
    });
  }, [orders, searchKeyword]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <button
          className="rounded-lg border border-[#d6d2c8] px-4 py-2 text-sm font-medium text-[#23422a] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => prev - 1)}
          disabled={currentPage === 1}
        >
          Trước
        </button>

        {pages.map((page) => (
          <button
            key={page}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              currentPage === page
                ? "bg-[#23422a] text-white"
                : "border border-[#d6d2c8] text-[#23422a] hover:bg-[#f3f1ea]"
            }`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="rounded-lg border border-[#d6d2c8] px-4 py-2 text-sm font-medium text-[#23422a] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
      </div>
    );
  };

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-6 py-10 md:px-8 md:py-12">
        <div className="mb-10">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-[#23422a] md:text-5xl">
            Lịch sử mua hàng
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[#424842] md:text-lg">
            Xem lại các khóa học bạn đã mua và theo dõi trạng thái thanh toán
            một cách trực quan, rõ ràng.
          </p>
        </div>

        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <StatusFilter
            activeFilter={activeFilter}
            onChange={setActiveFilter}
          />
          <SearchBox value={searchKeyword} onChange={setSearchKeyword} />
        </div>

        <div className="mb-6 text-sm text-[#424842]">
          Tổng đơn hàng: <span className="font-semibold">{totalItems}</span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-[#424842]">
            Đang tải dữ liệu...
          </div>
        ) : filteredOrders.length > 0 ? (
          <>
            <div className="space-y-5">
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            {renderPagination()}
          </>
        ) : (
          <EmptyState />
        )}
      </section>

      <Footer />
    </>
  );
};

export default PurchaseHistoryContent;
