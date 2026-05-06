import React, { useEffect, useState } from "react";
import { ExportOutlined, LoadingOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import AnimateOnScroll from "../../../utils/animateOnScroll";
import axiosInstance from "../../../utils/axios";
import { Empty } from "antd";

interface IBlog {
  _id: string;
  title: string;
  short_description: string;
  cover_image: string;
  createdAt: string;
}

const HomeNews = () => {
  const [posts, setPosts] = useState<IBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/blogs");
        const data: IBlog[] = res.data?.data ?? res.data ?? [];
        setPosts(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch (e) {
        console.error("Lỗi tải tin tức trang chủ:", e);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <AnimateOnScroll>
      <div className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-8 lg:px-12 py-10 sm:py-12 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div className="text-xl sm:text-2xl text-brand-700 font-bold">
            Tin tức công nghệ
          </div>
          <Link
            to="/blog"
            className="text-brand-700 font-semibold text-sm hover:underline w-fit"
          >
            Xem tất cả tin →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16 text-brand-700">
            <LoadingOutlined className="text-3xl" />
          </div>
        ) : posts.length === 0 ? (
          <div className="py-8 flex justify-center">
            <Empty description="Chưa có bài viết" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {posts.map((post) => (
              <Link
                key={post._id}
                to={`/blog/${post._id}`}
                className="bg-brand-25 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
              >
                <div className="h-44 sm:h-56 overflow-hidden">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="p-4 sm:p-6 flex flex-col gap-2 flex-1">
                  <p className="text-xs font-bold text-brand-700 uppercase tracking-wide">
                    Cập nhật
                  </p>
                  <h3 className="text-base sm:text-lg font-bold text-brand-700 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 flex-1">
                    {post.short_description}
                  </p>
                  <p className="text-brand-700 font-bold flex items-center gap-2 mt-2 text-sm sm:text-base">
                    Đọc thêm
                    <ExportOutlined />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AnimateOnScroll>
  );
};

export default HomeNews;
