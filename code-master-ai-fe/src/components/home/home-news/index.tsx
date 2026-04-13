import React from "react";
import { posts } from "../../../data/home/news";
import { ExportOutlined } from "@ant-design/icons";
import AnimateOnScroll from "../../../utils/animateOnScroll";

const HomeNews = () => {
    return (
        <AnimateOnScroll>
            <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-8 lg:px-12 py-10 sm:py-12 bg-white">

                <div className="text-xl sm:text-2xl text-brand-700 font-bold">
                    Tin tức công nghệ
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-brand-25 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                        >
                            {/* Image */}
                            <div className="h-44 sm:h-56 overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-4 sm:p-6 flex flex-col gap-2 flex-1">
                                <p className="text-xs font-bold text-brand-700 uppercase tracking-wide">
                                    {post.category}
                                </p>
                                <h3 className="text-base sm:text-lg font-bold text-brand-700 line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 flex-1">
                                    {post.description}
                                </p>
                                <p className="text-brand-700 font-bold flex items-center gap-2 mt-2 text-sm sm:text-base">
                                    Đọc thêm
                                    <ExportOutlined />
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </AnimateOnScroll>
    );
};

export default HomeNews;