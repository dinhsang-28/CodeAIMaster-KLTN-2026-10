import React from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { featuredCourses } from "../../../data/home/featuredCourses";
import AnimateOnScroll from "../../../utils/animateOnScroll";

const FeaturedCourses = () => {
    return (
        <section className="w-full py-10 sm:py-16 bg-brand-50">
            <AnimateOnScroll>
                <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 flex flex-col gap-6 sm:gap-8">

                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-xl sm:text-2xl text-brand-700">
                            <span>Khóa học</span> nổi bật
                        </h2>
                        <p className="font-medium text-brand-700 flex gap-2 items-center cursor-pointer text-sm sm:text-base">
                            Xem tất cả <ArrowRightOutlined />
                        </p>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                        {featuredCourses.map((item, index) => (
                            <div
                                key={index}
                                className="rounded-2xl h-full bg-white shadow overflow-hidden flex flex-col hover:shadow-lg transition"
                            >
                                {/* Image */}
                                <div className="relative">
                                    <img
                                        src={item.image}
                                        alt=""
                                        className="w-full h-40 sm:h-48 object-cover"
                                    />
                                    {item.isBestSeller && (
                                        <div className="absolute top-4 right-4 bg-brand-50 text-brand-700 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1 rounded-full">
                                            Bán chạy
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5 sm:p-8 flex flex-col gap-4 sm:gap-8 flex-1">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-xs sm:text-sm font-medium bg-gray-100 text-gray-800 w-max px-2 py-1 rounded-full">
                                            {item.level}
                                        </div>
                                        <div className="font-bold text-base sm:text-lg text-brand-700 break-words">
                                            {item.title}
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-600 break-words line-clamp-2">
                                            {item.description}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-auto flex items-center justify-between border-t pt-4">
                                        <div className="font-bold text-brand-600 text-sm sm:text-base">
                                            {item.price.toLocaleString()} VND
                                        </div>
                                        <div className="text-xs sm:text-sm font-medium bg-brand-25 text-brand-700 px-3 py-1 rounded-full cursor-pointer hover:bg-brand-200">
                                            Xem chi tiết
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </AnimateOnScroll>
        </section>
    );
};

export default FeaturedCourses;