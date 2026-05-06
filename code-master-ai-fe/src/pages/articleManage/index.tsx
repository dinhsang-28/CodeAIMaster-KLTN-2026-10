import React, { useState, useEffect } from "react";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import PermissionControl from "../../components/permissionControl";
import axiosInstance from "../../utils/axios"; 

const ArticleManage = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    cover_image: "",
    content: "",
    author: "",
  });

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
  };

  // FETCH
  const fetchArticles = async () => {
    try {
      const res = await axiosInstance.get("/blogs");
      setArticles(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // FILTER
  const filteredArticles = articles.filter(
    (a) =>
      a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.author?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const indexOfLast = currentPage * itemsPerPage;
  const currentArticles = filteredArticles.slice(
    indexOfLast - itemsPerPage,
    indexOfLast,
  );

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

  // ===================== CREATE / UPDATE =====================
  const handleSubmit = async () => {
    try {
      if (isEdit && editingId) {
        await axiosInstance.patch(
          `/blogs/${editingId}`,
          formData
        );

        alert("Cập nhật thành công!");
      } else {
        //CREATE
        await axiosInstance.post(
          "/blogs",
          {
            ...formData,
            slug: generateSlug(formData.title),
            short_description: formData.content.slice(0, 100),
          },
        );

        alert("Thêm bài viết thành công!");
      }

      setIsModalOpen(false);
      setIsEdit(false);
      setEditingId(null);

      setFormData({
        title: "",
        cover_image: "",
        content: "",
        author: "",
      });

      fetchArticles();
    } catch (error: any) {
      console.log(error.response?.data);
      alert(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  // ===================== EDIT =====================
  const handleEdit = (item: any) => {
    setIsEdit(true);
    setEditingId(item._id);
    setFormData({
      title: item.title,
      cover_image: item.cover_image,
      content: item.content,
      author: item.author,
    });
    setIsModalOpen(true);
  };

  // ===================== DELETE =====================
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Bạn có muốn xóa bài viết này không?");

    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/blogs/${id}`);
      alert("Xóa thành công!");
      fetchArticles();
    } catch (error: any) {
      console.log(error.response?.data);
      alert("Lỗi khi xóa!");
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-8 md:px-10">
      <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-700">
            Quản lý bài viết
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Quản lý nội dung tin tức và bài viết trên hệ thống.
          </p>
        </div>
        <PermissionControl permission="articles_create">
        <button
          onClick={() => {
            setIsModalOpen(true);
            setIsEdit(false);
            setEditingId(null);

            setFormData({
              title: "",
              cover_image: "",
              content: "",
              author: "",
            });
          }}
          className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-full font-semibold transition"
        >
          <PlusOutlined /> Viết bài
        </button>
        </PermissionControl>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <SearchOutlined className="absolute left-3 top-3 text-gray-400" />
        <input
          className="w-full pl-10 border border-brand-100 bg-white p-2.5 rounded-xl text-sm"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border border-brand-100 rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-[#fafaf9] border-b border-slate-200">
            <th className="p-3 text-left">Tiêu đề</th>
            <th className="p-3">Tác giả</th>
            <th className="p-3">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={3} className="text-center p-4">
                Đang tải...
              </td>
            </tr>
          ) : (
            currentArticles.map((item) => (
              <tr key={item._id} className="border-t border-slate-100 hover:bg-white/60">
                <td className="p-3">{item.title}</td>
                <td className="p-3 text-center">{item.author}</td>

                <td className="p-3 text-center flex justify-center gap-3">
                  <PermissionControl permission="articles_edit">
                  <button onClick={() => handleEdit(item)}>
                    <EditOutlined className="text-gray-500 hover:text-gray-800" />
                  </button>
                  </PermissionControl>
                  <PermissionControl permission="articles_delete">
                  <button onClick={() => handleDelete(item._id)}>
                    <DeleteOutlined className="text-gray-500 hover:text-gray-800" />
                  </button>
                  </PermissionControl>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
        <span className="font-medium">
          Trang {currentPage}/{totalPages || 1}
        </span>

        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-lg border border-brand-100 bg-white" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
            <LeftOutlined />
          </button>

          <button
            className="w-8 h-8 rounded-lg border border-brand-100 bg-white"
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
          >
            <RightOutlined />
          </button>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-8">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết"}
              </h2>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-black hover:text-red-600 text-xl"
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT FORM */}
              <div className="space-y-4">
                {/* TITLE */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Tiêu đề
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
                    placeholder="Nhập tiêu đề..."
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                {/* AUTHOR */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Tác giả
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
                    placeholder="Tên tác giả..."
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                  />
                </div>

                {/* IMAGE */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Link ảnh
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
                    placeholder="https://..."
                    value={formData.cover_image}
                    onChange={(e) =>
                      setFormData({ ...formData, cover_image: e.target.value })
                    }
                  />
                </div>

                {/* CONTENT */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nội dung
                  </label>
                  <textarea
                    rows={6}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none transition"
                    placeholder="Nhập nội dung..."
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* RIGHT PREVIEW */}
              <div className="flex flex-col gap-4">
                <p className="text-sm font-semibold text-gray-700">
                  Xem trước ảnh
                </p>

                <div className="w-full h-[220px] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                  {formData.cover_image ? (
                    <img
                      src={formData.cover_image}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        (e.currentTarget.src =
                          "https://via.placeholder.com/400x200")
                      }
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Chưa có ảnh</span>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Preview tiêu đề</p>
                  <h3 className="font-semibold text-gray-800 line-clamp-2">
                    {formData.title || "Tiêu đề sẽ hiển thị ở đây"}
                  </h3>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Preview nội dung</p>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {formData.content || "Nội dung preview..."}
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 mt-8 border-t pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition font-medium"
              >
                Hủy
              </button>

              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-lg"
              >
                {isEdit ? "Cập nhật" : "Đăng bài"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ArticleManage;
