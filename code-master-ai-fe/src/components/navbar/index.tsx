import React from "react";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CodeOutlined, SearchOutlined } from "@ant-design/icons";
import { useUserInfo } from "../../store/user";
import { UserOutlined } from "@ant-design/icons";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Dropdown, MenuProps } from "antd";
import { LogoutOutlined, ShoppingOutlined } from "@ant-design/icons";
import { GetCartLength } from "../../api/cart";
import { useUserCart } from "../../store/cart";
import { PostLogout } from "../../api/auth";
import { AutoComplete } from "antd";
import { useCourseStore } from "../../store/course";
import { CloseOutlined } from "@ant-design/icons";
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [navSelected, setNavSelected] = useState(location.pathname);
  const { userInfo, clearUserInfo } = useUserInfo();
  const { setQuantityCart, countQuantityCart } = useUserCart();
  const { globalCourses, setGlobalSearchKeyword } = useCourseStore();
  const [searchValue, setSearchValue] = useState("");
  const [options, setOptions] = useState<
    { value: string; label: React.ReactNode }[]
  >([]);

  const handleSearch = (value: string) => {
    setSearchValue(value);

    if (!value) {
      setOptions([]);
      return;
    }

    const filtered = globalCourses
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
          </div>
        ),
      }));

    setOptions(filtered);
  };

  const handleSelect = (value: string) => {
    setSearchValue(value);
    setGlobalSearchKeyword(value);
    navigate("/course");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setGlobalSearchKeyword(searchValue);
      navigate("/course");
    }
  };
  useEffect(() => {
    setNavSelected(location.pathname);
  }, [location]);
  useEffect(() => {
    const getCountCart = async () => {
      try {
        const data = await GetCartLength();
        console.log("Số lượng cart:", data.data);
        setQuantityCart(data.data);
      } catch (error) {
        console.error("Lỗi lấy số lượng cart:", error);
      }
    };
    getCountCart();
  }, []);

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div
          onClick={() => navigate("/profile")}
          className="font-medium text-brand-600 flex gap-3"
        >
          {<UserOutlined />}Thông tin cá nhân
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          onClick={() => navigate("/history-order")}
          className="font-medium text-brand-600 flex gap-3"
        >
          {<ShoppingOutlined />}Lịch sử đơn hàng
        </div>
      ),
    },
    {
      key: "3",
      // label: (
      //     <div onClick={ async() => {
      //         clearUserInfo();
      //         navigate('/login');
      //         localStorage.clear();
      //     }} className="font-medium text-brand-600 flex gap-3">{<LogoutOutlined />}Đăng xuất</div>
      // ),
      onClick: async () => {
        try {
          await PostLogout();
        } catch (error) {
          console.error("Lỗi khi đăng xuất:", error);
        } finally {
          clearUserInfo();
          window.location.href = "/login";
        }
      },
      label: (
        <div className="font-medium text-brand-600 flex gap-3">
          <LogoutOutlined />
          Đăng xuất
        </div>
      ),
    },
  ];

  return (
    <header className="bg-brand-50 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-14 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex space-x-8">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-brand-700 ">
              <NavLink to="/" className="flex items-center space-x-2">
                <CodeOutlined></CodeOutlined>
                <div>CodeMaster AI</div>
              </NavLink>
            </h1>
          </div>
          <nav className="hidden md:flex space-x-8 pt-2">
            <NavLink
              to="/"
              className={`font-medium text-brand-700 cursor-pointer transition-colors whitespace-nowrap hover:text-brand-400 ${navSelected === "/" ? "border-b-2 border-brand-700" : ""}`}
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/introduce"
              className={`font-medium text-brand-700 cursor-pointer transition-colors whitespace-nowrap hover:text-brand-400 ${navSelected === "/introduce" ? "border-b-2 border-brand-700" : ""}`}
            >
              Giới thiệu
            </NavLink>
            <NavLink
              to="/blog"
              className={`font-medium text-brand-700 cursor-pointer transition-colors whitespace-nowrap hover:text-brand-400 ${navSelected === "/blog" ? "border-b-2 border-brand-700" : ""}`}
            >
              Tin tức
            </NavLink>
            <NavLink
              to="/course"
              className={`font-medium text-brand-700 cursor-pointer transition-colors whitespace-nowrap hover:text-brand-400 ${navSelected === "/course" ? "border-b-2 border-brand-700" : ""}`}
            >
              Khóa học
            </NavLink>
            {/* <NavLink to="/cart" className={`font-medium text-brand-700 cursor-pointer transition-colors whitespace-nowrap hover:text-brand-400 ${navSelected === '/cart' ? 'border-b-2 border-brand-700' : ''}`}>Giỏ hàng</NavLink> */}
          </nav>
        </div>
        <div className="flex space-x-6">
          <div className="flex items-center rounded-full bg-brand-25 space-x-3 px-4 py-2 shadow-md w-[400px]">
            <SearchOutlined
              className="cursor-pointer hover:text-brand-400"
              onClick={() => {
                setGlobalSearchKeyword(searchValue);
                navigate("/course");
              }}
            />
            <AutoComplete
              value={searchValue}
              options={options}
              onSearch={handleSearch}
              onSelect={handleSelect}
              className="w-full custom-autocomplete"
              notFoundContent={searchValue ? "Không có kết quả tìm kiếm" : null}
            >
              <input
                className="bg-transparent w-full outline-none border-none focus:outline-none focus:ring-0 placeholder:text-gray-500 font-medium text-sm"
                type="text"
                placeholder="Tìm kiếm khóa học..."
                onKeyDown={handleKeyDown}
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
          </div>

          {userInfo && (
            <div className="flex items-center space-x-3 relative">
              <ShoppingCartOutlined
                onClick={() => navigate("/cart")}
                className="text-2xl text-brand-700 cursor-pointer hover:text-brand-400 "
              />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {countQuantityCart}
              </span>
            </div>
          )}
          {userInfo ? (
            <div>
              <div className="flex items-center space-x-3">
                <Dropdown menu={{ items }} placement="bottomLeft">
                  <div className="text-lg w-10 h-10 rounded-full bg-brand-600 font-medium text-white cursor-pointer flex items-center justify-center ">
                    {<UserOutlined />}
                  </div>
                </Dropdown>
              </div>
            </div>
          ) : (
            <div
              onClick={() => navigate("/login")}
              className="rounded-full bg-brand-600 text-white px-5 py-2 cursor-pointer font-semibold hover:text-brand-100 shadow-md"
            >
              Đăng Nhập
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
