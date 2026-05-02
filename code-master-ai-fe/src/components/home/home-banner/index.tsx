import React from "react";
import codeEditorImg from "../../../assets/Code Editor.png";
import { useNavigate } from "react-router-dom";
import AnimateOnScroll from "../../../utils/animateOnScroll";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const HomeBaner = () => {
    const navigate = useNavigate();

    const startTour = () => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            nextBtnText: 'Tiếp tục',
            prevBtnText: 'Quay lại',
            doneBtnText: 'Hoàn thành',
            steps: [
                { element: '#tour-banner-title', popover: { title: 'CodeMaster AI', description: 'Nền tảng học tập lập trình AI thế hệ mới, giúp bạn nâng tầm kỹ năng từ con số 0.', align: 'start' } },
                { element: '#tour-nav-links', popover: { title: 'Thanh Điều Hướng', description: 'Chuyển đổi giữa các trang: Trang chủ, Giới thiệu, Khóa học nhanh chóng.', align: 'start', side: "bottom" } },
                { element: '#tour-search', popover: { title: 'Tìm Kiếm Khóa Học', description: 'Gõ từ khóa để tìm các khóa học bạn quan tâm.', align: 'start', side: "bottom" } },
                { element: '#tour-auth', popover: { title: 'Tài khoản & Giỏ Hàng', description: 'Quản lý thông tin cá nhân và xem giỏ hàng của bạn.', align: 'start', side: "bottom" } },
                { element: '#tour-start-learning', popover: { title: 'Bắt Đầu Ngay', description: 'Nhấn vào đây để xem trực tiếp danh sách khóa học.', align: 'start', side: "right" } },
                { element: '#tour-featured-courses', popover: { title: 'Khóa Học Nổi Bật', description: 'Các khóa học được nhiều học viên đăng ký nhất.', align: 'start', side: "top" } },
                { element: '#tour-home-route', popover: { title: 'Lộ Trình Học Tập', description: 'Khám phá quy trình học khép kín từ Lý thuyết đến Thực hành code.', align: 'start', side: "top" } },
            ]
        });
        driverObj.drive();
    };

    return (
        <section className="min-h-[90vh] w-full bg-gradient-to-r from-brand-50 to-brand-200 flex items-center">
            <div className="w-full px-6 sm:px-10 lg:px-14 flex flex-col-reverse sm:flex-row items-center gap-8 py-12 sm:py-0">

                {/* Text */}
                <AnimateOnScroll defaultClasses="opacity-0 -translate-x-10">
                    <div className="flex-1 flex flex-col gap-2 justify-center text-center sm:text-left">
                        <div className="font-medium text-brand-700 bg-brand-50 shadow-md rounded-full flex items-center gap-2 w-fit px-4 py-1 mx-auto sm:mx-0">
                            <div className="w-1 h-1 bg-brand-700 rounded-full"></div>
                            NỀN TẢNG HỌC TẬP AI THẾ HỆ MỚI
                        </div>

                        <div id="tour-banner-title" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-700 mt-2">
                            Nâng tầm kỹ năng
                            lập trình cùng
                            <p className="text-brand-600">CodeMaster AI</p>
                        </div>

                        <div className="text-brand-700 font-light sm:pr-24 text-sm sm:text-base">
                            Học lập trình từ con số 0 với lộ trình bài bản, hỗ trợ từ trí tuệ
                            nhân tạo và tham gia trực tiếp vào các dự án thực tế quy mô lớn.
                        </div>

                        <div className="flex justify-center sm:justify-start space-x-3 mt-6">
                            <div
                                onClick={startTour}
                                className="font-medium shadow-sm bg-brand-600 text-white px-5 py-2 rounded-full cursor-pointer hover:bg-brand-700 text-sm sm:text-base"
                            >
                                Xem hướng dẫn
                            </div>
                            <div
                                id="tour-start-learning"
                                onClick={() => navigate("/course")}
                                className="font-medium shadow-sm bg-white text-brand-600 px-5 py-2 rounded-full cursor-pointer hover:bg-gray-100 text-sm sm:text-base"
                            >
                                Bắt đầu học ngay
                            </div>
                        </div>
                    </div>
                </AnimateOnScroll>

                {/* Image */}
                <AnimateOnScroll defaultClasses="opacity-0 translate-x-10">
                    <div className="flex-1 flex justify-center w-full">
                        <img
                            src={codeEditorImg}
                            alt="Code Editor"
                            className="w-full max-w-xs sm:max-w-sm lg:max-w-lg border-8 border-brand-50 rounded-3xl shadow-lg"
                        />
                    </div>
                </AnimateOnScroll>

            </div>
        </section>
    );
};

export default HomeBaner;