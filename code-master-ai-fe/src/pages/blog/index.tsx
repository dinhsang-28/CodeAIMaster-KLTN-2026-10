import React, { useState, useEffect } from "react";
import Footer from "../../components/footer";
import { Link } from "react-router-dom";
import AnimateOnScroll from "../../utils/animateOnScroll";
import axios from "axios";

// TYPE
interface IBlog {
  _id: string;
  title: string;
  slug: string;
  short_description: string;
  cover_image: string;
  content: string;
  author: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  og_image?: string;
  createdAt: string;
  updatedAt: string;
}

const Blog = () => {
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [featured, setFeatured] = useState<IBlog | null>(null);

  const tags = [
    "#Frontend",
    "#Python",
    "#Cloud",
    "#DevOps",
    "#MachineLearning",
  ];

  // LOAD MORE
  const [showAll, setShowAll] = useState(false);
  const blogsPerPage = 3;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(
        "https://codeaimaster-kltn-2026-10.onrender.com/api/v1/blogs",
      );
      const data: IBlog[] = res.data.data || [];

      setBlogs(data);
      setFeatured(data[0] || null);
    } catch (error) {
      console.error("Lỗi fetch blog:", error);
    }
  };

  // HIỂN THỊ
  const visibleBlogs = showAll ? blogs : blogs.slice(0, blogsPerPage);

  return (
    <>
      <main className="bg-[#f7f5f0]">
        {/* HERO */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <p className="text-sm text-gray-600 uppercase font-semibold tracking-wide">
            Bản tin học thuật
          </p>

          <h1 className="text-4xl md:text-5xl font-extrabold mt-3 md:mt-4 text-gray-900 leading-tight">
            Tin tức công nghệ
          </h1>

          <p className="text-base md:text-lg text-gray-600 mt-4 max-w-2xl">
            Cập nhật xu hướng công nghệ mới nhất.
          </p>
        </section>

        {/* FEATURED + SIDEBAR */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* FEATURED */}
          <AnimateOnScroll className="lg:col-span-2 space-y-4 md:space-y-6">
            {featured && (
              <>
                <div className="relative rounded-2xl overflow-hidden shadow-md">
                  <img
                    src={featured.cover_image}
                    className="w-full h-64 md:h-80 object-cover"
                    alt={featured.title}
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    {new Date(featured.createdAt).toLocaleDateString()}
                  </p>

                  <h2 className="text-2xl md:text-3xl font-bold">
                    {featured.title}
                  </h2>

                  <p className="text-gray-600">{featured.short_description}</p>

                  <Link
                    to={`/blog/${featured._id}`}
                    className="text-green-700 font-semibold"
                  >
                    Đọc thêm →
                  </Link>
                </div>
              </>
            )}
          </AnimateOnScroll>

          {/* SIDEBAR */}
          <AnimateOnScroll className="space-y-6">
            <div className="bg-gradient-to-br bg-brand-600 text-white p-6 rounded-2xl">
              <h3 className="font-bold text-lg">
                Đăng ký nhận tin tức mới nhất
              </h3>

              <p className="text-sm mt-2 text-white/90">
                Nhận thông báo về các khóa học và xu hướng công nghệ hàng tuần
                qua email.
              </p>

              <input
                type="email"
                placeholder="Email của bạn"
                className="w-full mt-4 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/70 outline-none text-sm focus:ring-2 focus:ring-white/50"
              />

              <button className="w-full mt-3 bg-white text-brand-700 py-2.5 rounded-xl font-semibold hover:bg-gray-100 transition">
                Đăng ký ngay
              </button>
            </div>

            <div className="bg-[#f3f1ea] p-6 rounded-2xl">
              <h3 className="font-bold text-gray-900 mb-4">Chủ đề phổ biến</h3>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-white text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </section>

        {/* LIST BLOG */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleBlogs.map((blog) => (
              <AnimateOnScroll
                key={blog._id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
              >
                <Link to={`/blog/${blog._id}`}>
                  <div className="h-48 overflow-hidden">
                    <img
                      src={blog.cover_image}
                      className="w-full h-full object-cover hover:scale-105 transition"
                      alt={blog.title}
                    />
                  </div>

                  <div className="p-5">
                    <p className="text-xs text-gray-500">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </p>

                    <h3 className="font-bold text-lg mt-1">{blog.title}</h3>

                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {blog.short_description}
                    </p>
                  </div>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </section>

        {/* BUTTON XEM THÊM */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-12 flex justify-center">
          {!showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="px-6 py-3 rounded-full bg-brand-600 text-white font-semibold shadow hover:bg-brand-700 transition"
            >
              Xem thêm
            </button>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Blog;
