import React, { useState } from "react";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";

const ArticleManage = () => {
  // ARTICLES DATA
  const [articles] = useState([
    {
      id: 1,
      thumbnail:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop",
      title: "Hướng dẫn làm chủ React Hooks trong năm 2024",
      category: "LẬP TRÌNH FRONTEND",
      author: "Admin Master",
      createdDate: "12/10/2023",
      status: "published",
    },
    {
      id: 2,
      thumbnail:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop",
      title: "Lộ trình học Web Frontend từ Zero đến Hero",
      category: "CHĂM SÓC HỌC TẬP",
      author: "Minh Anh",
      createdDate: "15/10/2023",
      status: "published",
    },
    {
      id: 3,
      thumbnail:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&h=100&fit=crop",
      title: "Tại sao Python là ngôn ngữ tốt nhất cho AI?",
      category: "TRỊ THỨC NHÂN TẠO",
      author: "Hoàng Nam",
      createdDate: "18/10/2023",
      status: "draft",
    },
    {
      id: 4,
      thumbnail:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop",
      title: "Top 5 công nghệ Backend nổi bật 2024",
      category: "CÔNG NGHỆ BACKEND",
      author: "Khánh Linh",
      createdDate: "20/10/2023",
      status: "published",
    },
    {
      id: 5,
      thumbnail:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&h=100&fit=crop",
      title: "Tại sao bạn nên học TypeScript ngay bây giờ?",
      category: "CÔNG NGHỆ MỚI",
      author: "Văn Tùng",
      createdDate: "08/10/2023",
      status: "draft",
    },
  ]);

  // SEARCH & PAGINATION
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = 12;

  // FILTERED ARTICLES
  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-700">
              Quản lý bài viết
            </h1>
            <p className="text-gray-600 mt-2">
              Danh sách các bài viết trên hệ thống.
            </p>
          </div>

          <button className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200 self-start md:self-auto">
            <PlusOutlined style={{ fontSize: 18 }} />
            Viết bài mới
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="relative">
          <SearchOutlined
            style={{
              fontSize: 16,
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
            }}
          />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* TABLE HEAD */}
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Thumbnail
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Tác giả
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody className="divide-y divide-gray-200">
              {filteredArticles.length > 0 ? (
                filteredArticles.slice(0, itemsPerPage).map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition">
                    {/* THUMBNAIL */}
                    <td className="px-6 py-4">
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </td>

                    {/* TITLE & CATEGORY */}
                    <td className="px-6 py-4">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        {article.category}
                      </p>
                    </td>

                    {/* AUTHOR */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {article.author.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-700">
                          {article.author}
                        </span>
                      </div>
                    </td>

                    {/* DATE */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {article.createdDate}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          article.status === "published"
                            ? "bg-brand-100 text-brand-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {article.status === "published"
                          ? "✓ XUẤT BẢN"
                          : "⊘ BẢN NHÁP"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition border border-e2e8f0">
                          <EditOutlined style={{ fontSize: 14 }} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition border border-red-100">
                          <DeleteOutlined style={{ fontSize: 14 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-gray-500 font-medium">
                      Không tìm thấy bài viết nào
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600 font-medium">
          TRANG {currentPage}/{totalPages}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-lg border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 hover:bg-gray-50 transition"
          >
            <LeftOutlined style={{ fontSize: 14 }} />
          </button>

          {[currentPage].map((page) => (
            <button
              key={page}
              className="w-10 h-10 rounded-lg bg-brand-700 text-white font-semibold"
            >
              {page}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-lg border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 hover:bg-gray-50 transition"
          >
            <RightOutlined style={{ fontSize: 14 }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleManage;
