import { ICourse } from "../../pages/course";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { createCartItem, GetCartLength } from "../../api/cart";
import { useUserCart } from "../../store/cart";
import { Modal } from "antd";
import { useState } from "react";
import { useUserInfo } from "../../store/user";

export const CourseCard = ({ course }: { course: ICourse }) => {
  const [open, setOpen] = useState(false);
  const [confirmLoading] = useState(false);
  const { userInfo } = useUserInfo();
  const [modalText, setModalText] = useState(
    "Vui lòng đăng nhập để mua khóa học!",
  );
  const navigate = useNavigate();
  const { setQuantityCart } = useUserCart();
  const showModal = () => {
    setOpen(true);
  };

  const handleOk = () => {
    if (!userInfo) {
      navigate(`/login`);
      return;
    } else {
      if (!userInfo?.phone) {
        navigate(`/profile`);
        return;
      }
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };
  const onCart = async () => {
    try {
      await createCartItem(course._id);
      const data = await GetCartLength();
      setQuantityCart(data.data);
      console.log("Thêm vào giỏ hàng thành công!");
    } catch (error) {
      console.log("Lỗi khi thêm vào giỏ hàng. Vui lòng thử lại.");
    }
  };

  const checkUser = (isBuyNow: boolean) => {
    if (!userInfo) {
      setModalText("Vui lòng đăng nhập để mua hàng!");
      showModal();
      return;
    }
    if (!userInfo?.phone) {
      setModalText("Vui lòng cập nhật thông tin để mua hàng!");
      showModal();
      return;
    }
    if (isBuyNow) {
      if (course.price === 0) {
        navigate(`/course/${course._id}`);
        return;
      } else {
        navigate(`/checkout/${course._id}`);
        return;
      }
    } else {
      onCart();
    }
  };
  return (
    <article className="group  flex h-full flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div
        onClick={() => navigate(`/course/${course._id}`)}
        className="relative aspect-[16/10] overflow-hidden cursor-pointer"
      >
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-brand-900/5 transition-all group-hover:bg-transparent" />
        {/* <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] shadow-lg 
             ${getCategoryBadgeClass(course.category.category_name)}
             `}
        >
          {course.category.category_name}
        </span> */}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div
          onClick={() => navigate(`/course/${course._id}`)}
          className="cursor-pointer"
        >
          <h3 className="mb-3 line-clamp-2 text-lg font-bold leading-snug text-brand-700">
            {course.title}
          </h3>

          <p className="mb-5 line-clamp-2 text-sm font-medium leading-relaxed text-slate-500">
            {course.description}
          </p>

          <div className="mb-5 flex flex-wrap items-center gap-4 text-xs font-bold text-brand-500">
            <span>25 bài</span>
            <span>22 giờ</span>
            <span>{course.level}</span>
          </div>
        </div>

        {/* <div className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-400">
          {renderStars(course.rating)}
          <span>({course.reviews})</span>
        </div> */}

        <div className="mt-auto flex items-center justify-between border-t border-brand-50 pt-6">
          <div className="flex flex-col">
            {/* {course.originalPrice && (
              <span className="text-[10px] font-medium tracking-wide text-slate-400 line-through">
                {course.originalPrice}
              </span>
            )} */}
            <span
              className={`text-lg font-bold ${
                course.price === 0 ? "text-brand-600" : "text-brand-600"
              }`}
            >
              {course.price.toLocaleString("vi-VN")} Đ
            </span>
          </div>

          <div className="flex items-center gap-2">
            {course.price !== 0 && (
              <button
                type="button"
                // onClick={() => onCart()}
                onClick={() => {
                  checkUser(false);
                }}
                className="flex size-10 items-center justify-center rounded-xl bg-brand-25 text-brand-600 transition-colors hover:bg-brand-50"
              >
                <ShoppingCartOutlined />
              </button>
            )}
            <button
              className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-800"
              onClick={() => {
                if (course.price === 0) {
                  navigate(`/learn/${course._id}`);
                } else {
                  checkUser(true);
                }
              }}
            >
              {course.price === 0 ? "Học" : "Mua"}
            </button>
          </div>
        </div>
      </div>

      <Modal
        title="Thông báo"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <p>{modalText}</p>
      </Modal>
    </article>
  );
};
