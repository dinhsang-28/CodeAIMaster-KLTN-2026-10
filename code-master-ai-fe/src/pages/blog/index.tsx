import React, { useState, useEffect } from "react";
import Footer from "../../components/footer";
import { Link } from "react-router-dom";
import AnimateOnScroll from "../../utils/animateOnScroll";

const Blog = () => {
  // Scroll to top khi component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // FEATURED ARTICLE DATA
  const featuredArticle = {
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop",
    tags: ["AI"],
    date: "15 Tháng 5, 2026",
    title: "Xu hướng AI trong năm 2026: Từ Generative sang Agentic AI",
    desc: "Khám phá cách các hệ thống AI đang chuyển mình từ việc tạo nội dung sang thực hiện các nhiệm vụ phức tạp một cách độc lập trong môi trường doanh nghiệp.",
  };

  // ARTICLE LIST DATA
  const articles = [
    {
      id: 1,
      img: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop",
      tag: "FRONTEND",
      date: "12 Tháng 5, 2024",
      title: "React có còn là lựa chọn hàng đầu cho năm 2025?",
      desc: "Phân tích xu thế công nghệ Frontend và các framework mới nhất được sử dụng.",
    },
    {
      id: 2,
      img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
      tag: "BACKEND",
      date: "08 Tháng 5, 2024",
      title: "Top ngôn ngữ lập trình nên học trong năm nay",
      desc: "Dự báo về các ngôn ngữ lập trình nổi bật và được tuyển dụng nhiều nhất.",
    },
    {
      id: 3,
      img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
      tag: "HỆ THỐNG",
      date: "01 Tháng 5, 2024",
      title: "Microservices vs Monolith: Lựa chọn nào cho Startup?",
      desc: "So sánh hai kiến trúc phổ biến và lợi ích của từng cách tiếp cận.",
    },
    {
      id: 4,
      img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop",
      tag: "BẢO MẬT",
      date: "29 Tháng 4, 2024",
      title: "Bảo mật API trong kỷ nguyên AI",
      desc: "Các thách thức bảo mật mới khi tích hợp AI với các hệ thống backend hiện tại.",
    },
    {
      id: 5,
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
      tag: "DỮ LIỆU",
      date: "20 Tháng 4, 2024",
      title: "Tương lai của Kỹ sư Dữ liệu trong năm 2026",
      desc: "Xu hướng công việc và kỹ năng cần thiết cho data engineers trong thời đại AI.",
    },
    {
      id: 6,
      img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
      tag: "MOBILE",
      date: "15 Tháng 4, 2024",
      title: "Flutter vs React Native: Cuộc chiến không hồi kết",
      desc: "So sánh hiệu năng, tốc độ phát triển và cộng đồng hỗ trợ của hai framework.",
    },
  ];

  const tags = ["#Frontend", "#Python", "#Cloud", "#DevOps", "#MachineLearning"];
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  return (
    <>
      <main className="bg-brand-25">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <p className="text-sm text-gray-600 uppercase font-semibold tracking-wide">
            Bản tin học thuật
          </p>

          <h1 className="text-4xl md:text-5xl font-extrabold mt-3 md:mt-4 text-gray-900 leading-tight">
            Tin tức công nghệ
          </h1>

          <p className="text-base md:text-lg text-gray-600 mt-4 max-w-2xl leading-relaxed">
            Cập nhật xu hướng mới nhất về lập trình và công nghệ để không bao giờ bị bỏ lại phía sau trong kỷ nguyên số.
          </p>
        </section>

        {/* FEATURED + SIDEBAR */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* FEATURED ARTICLE */}
          <AnimateOnScroll className="lg:col-span-2 space-y-4 md:space-y-6">
            <div className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition duration-300">
              <img
                src={featuredArticle.img}
                className="w-full h-64 md:h-80 object-cover"
                alt="Featured"
              />

              {/* TAGS OVERLAY */}
              <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                {featuredArticle.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 md:space-y-3">
              <p className="text-sm text-gray-500 font-medium">
                {featuredArticle.date}
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {featuredArticle.title}
              </h2>

              <p className="text-base text-gray-600 leading-relaxed">
                {featuredArticle.desc}
              </p>

              <Link
                to="/blog/1"
                className="inline-block text-brand-600 font-semibold hover:text-brand-700 transition mt-2"
              >
                Đọc thêm →
              </Link>
            </div>
          </AnimateOnScroll>

          {/* SIDEBAR */}
          <AnimateOnScroll className="space-y-6">
            {/* SUBSCRIBE */}
            <div className="bg-brand-600 text-white p-6 md:p-8 rounded-2xl shadow-md">
              <h3 className="font-bold text-lg md:text-xl">
                Đăng ký nhận tin tức mới nhất
              </h3>

              <p className="text-sm md:text-base mt-2 md:mt-3 text-white/90 leading-relaxed">
                Nhận thông báo về các khóa học và xu hướng công nghệ hàng tuần qua email.
              </p>

              <input
                type="email"
                placeholder="Email của bạn"
                className="w-full mt-4 px-4 py-2.5 rounded-lg text-gray-900 outline-none text-sm placeholder-gray-500 font-medium"
              />

              <button className="w-full mt-3 bg-white text-brand-600 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition duration-200">
                Đăng ký ngay
              </button>
            </div>

            {/* TAGS */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Chủ đề phổ biến</h3>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </section>

        {/* ARTICLES GRID */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {articles.map((article) => (
              <AnimateOnScroll
                key={article.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-brand-200 transition duration-300"
              >
              <Link
                to={`/blog/${article.id}`}
                className="block"
              >
                {/* IMAGE */}
                <div className="relative overflow-hidden h-48 md:h-56">
                  <img
                    src={article.img}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    alt={article.title}
                  />

                  {/* TAG */}
                  <span className="absolute bottom-3 left-3 bg-white text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {article.tag}
                  </span>
                </div>

                {/* CONTENT */}
                <div className="p-5 md:p-6 space-y-3">
                  <p className="text-xs text-gray-500 font-medium">
                    {article.date}
                  </p>

                  <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-brand-600 transition">
                    {article.title}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {article.desc}
                  </p>

                  <p className="text-sm font-semibold text-brand-600 group-hover:text-brand-700 transition pt-2">
                    Đọc thêm →
                  </p>
                </div>
              </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </section>

        {/* PAGINATION */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 flex justify-center items-center gap-2">
          <button className="w-10 h-10 rounded-full border border-gray-300 hover:border-brand-600 hover:text-brand-600 text-gray-700 font-semibold transition">
            ‹
          </button>

          {[1, 2, 3, "...", totalPages].map((page, i) => (
            <button
              key={i}
              onClick={() => typeof page === "number" && setCurrentPage(page)}
              className={`w-10 h-10 rounded-full font-semibold transition ${
                page === currentPage
                  ? "bg-gray-900 text-white shadow-md"
                  : page === "..."
                  ? "text-gray-500 cursor-default"
                  : "border border-gray-300 text-gray-700 hover:border-brand-600 hover:text-brand-600"
              }`}
            >
              {page}
            </button>
          ))}

          <button className="w-10 h-10 rounded-full border border-gray-300 hover:border-brand-600 hover:text-brand-600 text-gray-700 font-semibold transition">
            ›
          </button>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Blog;
