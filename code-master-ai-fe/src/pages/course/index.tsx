import Footer from "../../components/footer";
import { GetCategoryNames } from "../../data/course";
import { useEffect, useState } from "react";
import { CourseCard } from "../../components/courseCart";
import { AutoComplete, Empty } from "antd";
import { CloseOutlined, LoadingOutlined } from "@ant-design/icons";
import {
  CompassOutlined,
  SearchOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { Dropdown, type MenuProps } from "antd";
import { GetCourses } from "../../api/course";
import { useCourseStore } from "../../store/course";
import { useUserInfo } from "../../store/user";

export interface ICourse {
  _id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  thumbnail: string;
  status: string;
  category: {
    _id: string;
    category_name: string;
  };
}

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [coursesData, setCourses] = useState<ICourse[]>([]);
  const [categories, setCategories] = useState<string[]>(["Tất cả"]);
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">(
    "all",
  );
  const { globalSearchKeyword, setGlobalCourses } = useCourseStore();
  const [searchValue, setSearchValue] = useState(globalSearchKeyword);
  const { userInfo } = useUserInfo();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setSearchValue(globalSearchKeyword);
  }, [globalSearchKeyword]);

  const [sortBy, setSortBy] = useState<
    "newest" | "popular" | "priceAsc" | "priceDesc"
  >("newest");
  const [options, setOptions] = useState<
    { value: string; label: React.ReactNode }[]
  >([]);

  const togglePriceFilter = (type: "free" | "paid") => {
    setPriceFilter((prev) => (prev === type ? "all" : type));
  };

  const sortItems: MenuProps["items"] = [
    { key: "newest", label: <span>Mới nhất</span> },
    { key: "popular", label: <span>Phổ biến</span> },
    { key: "priceAsc", label: <span>Giá tăng dần</span> },
    { key: "priceDesc", label: <span>Giá giảm dần</span> },
  ];

  const handleSortMenuClick: MenuProps["onClick"] = (e) => {
    setSortBy(e.key as any);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case "popular":
        return "Phổ biến";
      case "priceAsc":
        return "Giá tăng dần";
      case "priceDesc":
        return "Giá giảm dần";
      case "newest":
      default:
        return "Mới nhất";
    }
  };

  //search autocomplete
  const handleSearch = (value: string) => {
    setSearchValue(value);

    if (!value) {
      setOptions([]);
      return;
    }

    const filtered = coursesData
      .filter((course) =>
        course.title.toLowerCase().includes(value.toLowerCase()),
      )
      .map((course) => ({
        value: course.title,
        label: (
          <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
            <img
              src={course.thumbnail}
              alt=""
              className="w-10 h-10 object-cover rounded-lg"
            />

            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800">
                {course.title}
              </span>
              <span className="text-xs text-slate-500">
                {course.category.category_name}
              </span>
            </div>

            <span className="ml-auto text-xs font-bold text-green-600">
              {course.price === 0 ? "Free" : `${course.price}đ`}
            </span>
          </div>
        ),
      }));

    setOptions(filtered);
  };

  let filteredCourses = [...coursesData];

  // 1. Lọc theo Autocomplete Text (Search)
  if (searchValue) {
    filteredCourses = filteredCourses.filter((course) =>
      course.title.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }

  // 2. Lọc theo Category
  if (selectedCategory !== "Tất cả") {
    filteredCourses = filteredCourses.filter(
      (course) => course.category.category_name === selectedCategory,
    );
  }

  // 3. Lọc theo Giá (Miễn phí / Trả phí)
  if (priceFilter === "free") {
    filteredCourses = filteredCourses.filter((course) => course.price === 0);
  } else if (priceFilter === "paid") {
    filteredCourses = filteredCourses.filter((course) => course.price > 0);
  }

  // 4. Sắp xếp (Sort)
  if (sortBy === "priceAsc") {
    filteredCourses.sort((a, b) => a.price - b.price);
  } else if (sortBy === "priceDesc") {
    filteredCourses.sort((a, b) => b.price - a.price);
  } else if (sortBy === "newest") {
    filteredCourses.sort((a, b) => b._id.localeCompare(a._id));
  } else if (sortBy === "popular") {
    filteredCourses.sort((a, b) => a._id.localeCompare(b._id)); // Fake popular bằng cách đảo ngược thay _id
  }

  useEffect(() => {
    setSearchValue("");
    window.scrollTo(0, 0);
    const fetchData = async () => {
      setLoading(true);
      try {
        const [coursesRes, categoryNames] = await Promise.all([
          GetCourses(),
          GetCategoryNames(),
        ]);
        setCourses(coursesRes.data);
        setGlobalCourses(coursesRes.data);
        setCategories(["Tất cả", ...categoryNames]);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setGlobalCourses]);

  return (
    <>
      <main className="min-h-screen bg-brand-25 text-slate-800">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 sm:py-12 md:px-10 xl:px-0">
          {/* ── Header ── */}
          <section className="mb-8 sm:mb-12 flex flex-col gap-6 sm:gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-brand-700">
                Tất cả khóa học
              </h1>
              <p className="text-sm sm:text-base md:text-xl font-normal leading-relaxed text-slate-600">
                Khám phá các lộ trình học tập từ cơ bản đến nâng cao cùng chuyên
                gia AI hàng đầu Việt Nam.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-center justify-center">
              <button
                type="button"
                className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-gray-200 px-5 sm:px-7 py-3 sm:py-3.5 font-bold text-brand-700 text-sm sm:text-base transition-colors hover:bg-gray-100 w-full sm:w-auto justify-center sm:justify-start"
              >
                <CompassOutlined />
                <span>Nhận tư vấn lộ trình</span>
              </button>
            </div>
          </section>

          {/* ── Filter bar ── */}
          <section className="z-30 mb-8 sm:mb-10">
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Search + price toggle + sort */}
              <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center">
                {/* Search */}
                <div className="w-full md:flex-1">
                  <label className="flex items-center rounded-2xl border border-brand-100 bg-white px-4 sm:px-5 py-3 sm:py-3.5 shadow-sm">
                    <span className="mr-3 text-slate-400">
                      <SearchOutlined />
                    </span>
                    {/* <input
                      type="text"
                      placeholder="Tìm kiếm khóa học, kỹ năng, công nghệ..."
                      className="w-full border-none bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                    /> */}
                    <AutoComplete
                      value={searchValue}
                      options={options}
                      onSearch={handleSearch}
                      onSelect={(value) => setSearchValue(value)}
                      className="w-full custom-autocomplete"
                      notFoundContent={
                        searchValue ? "Không có kết quả tìm kiếm" : null
                      }
                    >
                      <input
                        placeholder="Tìm kiếm khóa học, kỹ năng, công nghệ..."
                        className="w-full border-none bg-transparent text-sm font-medium text-slate-800 outline-none focus:outline-none focus:ring-0 placeholder:text-slate-400"
                      />
                    </AutoComplete>
                    {searchValue && (
                      <button
                        type="button"
                        onClick={() => setSearchValue("")}
                        className="ml-2 text-slate-400 hover:text-slate-600"
                      >
                        <CloseOutlined />
                      </button>
                    )}
                  </label>
                </div>

                {/* Price toggle + sort */}
                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  {/* Free / Paid toggle */}
                  <div className="flex rounded-2xl border border-brand-100 bg-white p-1 shadow-sm shrink-0">
                    <button
                      type="button"
                      onClick={() => togglePriceFilter("free")}
                      className={`rounded-xl px-5 sm:px-7 py-2 sm:py-2.5 text-sm font-bold transition-colors ${
                        priceFilter === "free"
                          ? "bg-brand-600 text-white shadow"
                          : "text-slate-600 hover:bg-brand-25"
                      }`}
                    >
                      Miễn phí
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePriceFilter("paid")}
                      className={`rounded-xl px-5 sm:px-7 py-2 sm:py-2.5 text-sm font-bold transition-colors ${
                        priceFilter === "paid"
                          ? "bg-brand-600 text-white shadow"
                          : "text-slate-600 hover:bg-brand-25"
                      }`}
                    >
                      Trả phí
                    </button>
                  </div>

                  {/* Sort dropdown */}
                  <Dropdown
                    menu={{ items: sortItems, onClick: handleSortMenuClick }}
                    placement="bottomLeft"
                  >
                    <div className="rounded-2xl border flex gap-2 items-center border-brand-100 bg-white px-4 sm:px-6 py-2.5 sm:py-3 cursor-pointer text-sm font-bold text-slate-700 shadow-sm outline-none shrink-0">
                      {getSortLabel()}
                      <DownOutlined />
                    </div>
                  </Dropdown>
                </div>
              </div>

              {/* Category pills */}
              <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap rounded-full px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all ${
                      selectedCategory === category
                        ? "bg-brand-700 text-white shadow-lg"
                        : "border border-brand-100 bg-white text-slate-600 hover:bg-brand-25"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Course grid ── */}
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingOutlined className="text-4xl" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex justify-center py-20">
              <Empty description="Không có kết quả tìm kiếm" />
            </div>
          ) : (
            <section className="grid grid-cols-1 gap-5 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </section>
          )}

          {/* ── Load more ── */}
          {/* <div className="mt-10 sm:mt-16 flex justify-center">
            <button
              type="button"
              className="flex items-center gap-3 rounded-2xl border-2 border-brand-600 px-8 sm:px-10 py-3 sm:py-4 font-bold text-brand-700 text-sm sm:text-base transition-colors hover:bg-brand-50"
            >
              <span>Tải thêm khóa học</span>
              <DownOutlined />
            </button>
          </div> */}
          {userInfo ? (
            <></>
          ) : (
            <div>
              <section className="relative mt-16 sm:mt-24 overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] bg-brand-700 p-6 sm:p-10 md:p-16 text-white shadow-2xl">
                <div className="absolute right-0 top-0 h-full w-1/2 opacity-5">
                  <div className="h-full w-full rounded-full bg-white blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col items-center justify-between gap-8 sm:gap-12 md:flex-row">
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
                      Lộ trình học tập cá nhân hóa
                    </h2>
                    <p className="mb-6 sm:mb-8 max-w-xl text-base sm:text-lg md:text-xl font-medium leading-relaxed text-brand-100">
                      Bạn chưa biết bắt đầu từ đâu? Hãy để AI của chúng tôi
                      thiết kế lộ trình riêng phù hợp với năng lực và mục tiêu
                      của bạn.
                    </p>

                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:justify-start">
                      {[
                        "Đánh giá năng lực",
                        "Tài liệu chọn lọc",
                        "Cam kết đầu ra",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2 sm:gap-2.5 rounded-xl sm:rounded-2xl border border-white/10 bg-white/10 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-bold backdrop-blur-sm"
                        >
                          <span className="text-brand-200">✔</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full md:w-auto shrink-0 rounded-xl sm:rounded-2xl bg-white px-8 sm:px-12 py-4 sm:py-5 font-black text-brand-700 text-sm sm:text-base transition-all hover:scale-105 hover:bg-brand-50"
                  >
                    Khám phá ngay
                  </button>
                </div>
              </section>

              {/* ── Social proof CTA ── */}
              <section className="mt-10 sm:mt-16 rounded-[1.5rem] sm:rounded-[2rem] border border-brand-100 bg-brand-50 px-4 sm:px-6 md:px-10 py-12 sm:py-16 text-center">
                <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-black text-brand-700">
                  Hàng ngàn học viên đã thay đổi sự nghiệp
                </h2>
                <p className="mx-auto mb-8 sm:mb-12 max-w-4xl text-base sm:text-lg md:text-xl font-medium leading-relaxed text-slate-600">
                  Bắt đầu hành trình chinh phục công nghệ cùng CodeMaster AI
                  ngay hôm nay.
                </p>
                <button
                  type="button"
                  className="rounded-[1rem] sm:rounded-[1.5rem] bg-brand-600 px-10 sm:px-14 py-4 sm:py-5 text-lg sm:text-xl font-black text-white shadow-xl transition-all hover:-translate-y-1 hover:bg-brand-700"
                >
                  Bắt đầu học ngay
                </button>
              </section>
            </div>
          )}
          {/* ── AI roadmap banner ── */}
        </div>
      </main>
      <Footer />
    </>
  );
}
