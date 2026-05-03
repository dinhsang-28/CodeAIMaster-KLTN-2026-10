import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  CodeOutlined,
  BookFilled,
  SearchOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Dropdown, MenuProps, AutoComplete } from "antd";

import { useUserInfo } from "../../store/user";
import { useUserCart } from "../../store/cart";
import { useCourseStore } from "../../store/course";

import { GetCartLength } from "../../api/cart";
import { PostLogout } from "../../api/auth";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [navSelected, setNavSelected] = useState(location.pathname);
  const [isOpen, setIsOpen] = useState(false);

  const { userInfo, clearUserInfo } = useUserInfo();
  const { setQuantityCart, countQuantityCart } = useUserCart();
  const { globalCourses, setGlobalSearchKeyword } = useCourseStore();

  const [searchValue, setSearchValue] = useState("");
  const [options, setOptions] = useState<
    { value: string; label: React.ReactNode }[]
  >([]);

  // ===== SEARCH =====
  const handleSearch = (value: string) => {
    setSearchValue(value);

    if (!value) {
      setOptions([]);
      return;
    }

    const filtered = globalCourses
      ?.filter((course) =>
        course.title.toLowerCase().includes(value.toLowerCase()),
      )
      .map((course) => ({
        value: course.title,
        label: (
          <div
            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
            onClick={() => {
              navigate(`/course/${course._id}`);
              setIsOpen(false);
            }}
          >
            <img
              src={course.thumbnail}
              alt=""
              className="w-10 h-10 object-cover rounded-lg"
            />
            <div>
              <div className="text-sm font-semibold">{course.title}</div>
              <div className="text-xs text-gray-500">
                {course.category?.category_name}
              </div>
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

  // ===== EFFECT =====
  useEffect(() => {
    setNavSelected(location.pathname);
  }, [location]);

  useEffect(() => {
    const getCountCart = async () => {
      try {
        const data = await GetCartLength();
        setQuantityCart(data.data);
      } catch (err) {
        console.error(err);
      }
    };
     // eslint-disable-next-line 
    getCountCart();
  }, [setQuantityCart]);

  // ===== MENU USER =====
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div onClick={() => navigate("/profile")} className="flex gap-2">
          <UserOutlined /> Thông tin
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div onClick={() => navigate("/history-order")} className="flex gap-2">
          <ShoppingOutlined /> Đơn hàng
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div
          onClick={async () => {
            await PostLogout();
            clearUserInfo();
            window.location.href = "/login";
          }}
          className="flex gap-2"
        >
          <LogoutOutlined /> Đăng xuất
        </div>
      ),
    },
  ];

  return (
    <header className="bg-brand-50 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-10 py-3 flex items-center justify-between">
        {/* ===== LEFT ===== */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-brand-700"
          >
            <CodeOutlined />
            CodeMaster AI
          </NavLink>

          {/* Desktop Menu */}
          <nav className="hidden md:flex gap-6">
            <NavLink
              to="/"
              className={navSelected === "/" ? "font-bold border-b-2" : ""}
            >
              Trang chủ
            </NavLink>
            <NavLink to="/introduce">Giới thiệu</NavLink>
            <NavLink to="/blog">Tin tức</NavLink>
            <NavLink to="/course">Khóa học</NavLink>
          </nav>
        </div>

        {/* ===== RIGHT ===== */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Search */}
          <div className="hidden md:flex items-center bg-white px-3 py-2 rounded-full shadow w-[300px] lg:w-[400px]">
            <SearchOutlined
              className="cursor-pointer"
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
              className="w-full"
            >
              <input
                className="w-full outline-none px-2"
                placeholder="Tìm khóa học..."
              />
            </AutoComplete>
          </div>

          {/* Auth + Cart */}
          {userInfo && (
            <>
              <BookFilled
                onClick={() => navigate("/myCourses")}
                className="text-xl cursor-pointer"
              />
              <div className="relative">
                <ShoppingCartOutlined
                  onClick={() => navigate("/cart")}
                  className="text-xl cursor-pointer"
                />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {countQuantityCart}
                </span>
              </div>
            </>
          )}

          {/* User */}
          {userInfo ? (
            <Dropdown menu={{ items }}>
              <div className="w-8 h-8 bg-brand-600 text-white flex items-center justify-center rounded-full cursor-pointer">
                <UserOutlined />
              </div>
            </Dropdown>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-brand-600 text-white px-4 py-1 rounded-full"
            >
              Login
            </button>
          )}

          {/* Hamburger */}
          <div className="md:hidden">
            <MenuOutlined
              className="text-xl cursor-pointer"
              onClick={() => setIsOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* ===== MOBILE MENU ===== */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg px-6 py-4 space-y-4">
          <div className="flex justify-between">
            <div className="font-bold">Menu</div>
            <CloseOutlined onClick={() => setIsOpen(false)} />
          </div>

          <div
            className="cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => navigate("/")}
          >
            Trang chủ
          </div>
          <div
            className="cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => navigate("/introduce")}
          >
            Giới thiệu
          </div>
          <div
            className="cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => navigate("/blog")}
          >
            Tin tức
          </div>
          <div
            className="cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => navigate("/course")}
          >
            Khóa học
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
