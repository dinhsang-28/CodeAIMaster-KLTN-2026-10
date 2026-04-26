import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

interface Blog {
  _id: string;
  title: string;
  cover_image: string;
  content: string;
  author: string;
  createdAt: string;
  keywords?: string[];
}

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogDetail();
    fetchRelatedBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchBlogDetail = async () => {
    try {
      const res = await axios.get(
        `https://codeaimaster-kltn-2026-10.onrender.com/api/v1/blogs/${id}`,
      );
      setBlog(res.data.data);
    } catch (error) {
      console.error("Lỗi detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async () => {
    try {
      const res = await axios.get(
        "https://codeaimaster-kltn-2026-10.onrender.com/api/v1/blogs",
      );

      const data: Blog[] = res.data.data || [];

      const filtered = data.filter((item) => item._id !== id).slice(0, 3);

      setRelatedBlogs(filtered);
    } catch (error) {
      console.error("Lỗi related:", error);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Đang tải bài viết...</p>;
  }

  if (!blog) {
    return <p className="text-center mt-10">Không tìm thấy bài viết</p>;
  }

  return (
    <div className="bg-[#f7f5f0] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-3 gap-10">
        {/* LEFT CONTENT */}
        <div className="lg:col-span-2">
          <p className="text-sm text-gray-500 uppercase mb-2">
            Lập trình ứng dụng
          </p>

          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
            {blog.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-gray-500 mt-4">
            <span>{blog.author}</span>
            <span>•</span>
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>

          {/* COVER */}
          <img
            src={blog.cover_image}
            className="w-full h-80 object-cover rounded-xl mt-6"
            alt={blog.title}
            onError={(e) =>
              (e.currentTarget.src = "https://via.placeholder.com/800x400")
            }
          />

          {/* CONTENT */}
          <div
            className="prose max-w-none mt-8"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* TAGS */}
          <div className="flex flex-wrap gap-2 mt-8">
            {blog.keywords?.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-200 px-3 py-1 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-[#f3f1ea] p-6 rounded-2xl">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">
              Chủ đề phổ biến
            </h3>

            <div className="space-y-3 text-sm text-gray-700">
              {[
                { name: "Lập trình Frontend", count: "12" },
                { name: "AI", count: "08" },
                { name: "Kỹ năng Dev", count: "05" },
                { name: "Mobile App", count: "15" },
              ].map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name}</span>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-md font-semibold">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#f3f1ea] p-6 rounded-2xl">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">
              Tags nổi bật
            </h3>

            <div className="flex flex-wrap gap-2">
              {["Next.js", "TailwindCSS", "Python", "AI", "GitHub"].map(
                (tag, index) => (
                  <span
                    key={index}
                    className="bg-white text-gray-700 px-3 py-1 rounded-full text-xs shadow"
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RELATED BLOG */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Bài viết liên quan
          </h2>

          <Link to="/blog" className="text-brand-700 text-sm font-semibold">
            Xem tất cả →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {relatedBlogs.map((item) => (
            <Link
              to={`/blog/${item._id}`}
              key={item._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden"
            >
              <div className="h-40 overflow-hidden">
                <img
                  src={item.cover_image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4">
                <p className="text-xs text-gray-500 mb-1">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>

                <h3 className="font-semibold text-gray-900 line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {item.content?.slice(0, 80)}...
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BlogDetail;
