import React, { useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom"; // 🚨 Thêm Navigate
import {
  AppstoreOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReadOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  CodeOutlined,
  IdcardOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { Code } from "lucide-react";
import { useUserInfo } from "../../store/user";

type MenuItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

const mainMenuItems: MenuItem[] = [
  { to: "/admin", label: "Bảng điều khiển", icon: <DashboardOutlined /> },
  {
    to: "/admin/courses",
    label: "Quản lý khóa học",
    icon: <AppstoreOutlined />,
  },
  { to: "/admin/exercises", label: "Quản lý bài tập", icon: <ReadOutlined /> },
  {
    to: "/admin/categories",
    label: "Quản lý thể loại",
    icon: <AppstoreOutlined />,
  },
  {
    to: "/admin/articles",
    label: "Quản lý bài viết",
    icon: <FileTextOutlined />,
  },
  {
    to: "/admin/users",
    label: "Quản lý người dùng",
    icon: <UsergroupAddOutlined />,
  },
  { to: "/admin/roles", label: "Quản lý nhóm quyền", icon: <IdcardOutlined /> },
  {
    to: "/admin/permissions",
    label: "Quản lý phân quyền",
    icon: <KeyOutlined />,
  },
];

const bottomMenuItems: MenuItem[] = [
  { to: "/admin/profile", label: "Hồ sơ cá nhân", icon: <UserOutlined /> },
  { to: "/admin/settings", label: "Settings", icon: <SettingOutlined /> },
];

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const userInfo = useUserInfo((state) => state.userInfo);
  const clearUserInfo = useUserInfo((state) => state.clearUserInfo);

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  const permissions = userInfo.permissions || [];
  if (permissions.length === 0) {
    return <Navigate to="/" replace />;
  }

  // 🚨 3. HÀM KIỂM TRA QUYỀN TRUY CẬP ROUTE VÀ MENU
  const checkPermission = (path: string) => {
    if (path === "/admin") return true;
    if (path.includes("/courses")) return permissions.includes("courses_view");
    if (path.includes("/exercises"))
      return permissions.includes("exercises_view");
    if (path.includes("/categories"))
      return permissions.includes("categories_view");
    if (path.includes("/articles"))
      return permissions.includes("articles_view");
    if (path.includes("/users")) return permissions.includes("view_user");
    if (path.includes("/settings"))
      return permissions.includes("settings_view");
    if (path.includes("/roles")) return permissions.includes("roles_view");
    if (path.includes("/permissions"))
      return permissions.includes("permissions_view");
    // Tuỳ chỉnh nếu có quyền settings
    return true;
  };

  if (!checkPermission(location.pathname)) {
    return <Navigate to="/admin" replace />;
    // (Hoặc đá sang trang /admin/403 nếu bạn làm riêng trang đó)
  }
  const filteredMainMenu = mainMenuItems.filter((item) =>
    checkPermission(item.to),
  );
  const filteredBottomMenu = bottomMenuItems.filter((item) =>
    checkPermission(item.to),
  );

  const getPageTitle = () => {
    if (location.pathname === "/admin") return "Bảng điều khiển";
    if (location.pathname.includes("/courses")) return "Quản lý khóa học";
    if (location.pathname.includes("/profile")) return "Hồ sơ cá nhân";
    if (location.pathname.includes("/exercises")) return "Quản lý bài tập";
    if (location.pathname.includes("/categories")) return "Quản lý thể loại";
    if (location.pathname.includes("/articles")) return "Quản lý bài viết";
    if (location.pathname.includes("/users")) return "Quản lý người dùng";
    if (location.pathname.includes("/settings")) return "Settings";
    return "Trang quản trị";
  };

  const pageTitle = getPageTitle();

  return (
    <div className="flex min-h-screen bg-brand-25 text-brand-900">
      {/* --- SIDEBAR --- */}
      <aside
        className={`flex min-h-screen flex-col border-r border-brand-100 bg-brand-50 transition-all duration-300 ${collapsed ? "w-[88px]" : "w-[280px]"}`}
      >
        <div
          className={`flex h-[76px] items-center ${collapsed ? "justify-center px-2" : "px-6"}`}
        >
          {!collapsed ? (
            <h1 className="text-[18px] font-bold tracking-tight text-brand-600">
              <NavLink to="/admin" className="flex items-center gap-3">
                <div className="bg-brand-600 rounded-full w-8 h-8 flex items-center justify-center">
                  <CodeOutlined className="text-white" />
                </div>
                <div>
                  <p>CodeMaster AI</p>
                  <p className="font-normal text-sm">ADMIN CONSOLE</p>
                </div>
              </NavLink>
            </h1>
          ) : (
            <NavLink
              to="/admin"
              className="flex h-10 w-10 items-center justify-center text-brand-600 text-lg font-extrabold"
            >
              <CodeOutlined />
            </NavLink>
          )}
        </div>

        <div className="flex-1 space-y-2 px-3 py-5">
          {filteredMainMenu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                `group flex w-full items-center rounded-2xl transition-all duration-200 ${collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"} ${isActive ? "bg-brand-100 text-brand-700 shadow-sm" : "text-brand-900 hover:bg-brand-100/70 hover:text-brand-700"}`
              }
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {!collapsed && (
                <span className="text-base font-medium tracking-tight">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="space-y-2 border-t border-brand-100 px-3 py-4">
          {filteredBottomMenu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex w-full items-center rounded-2xl transition-all duration-200 ${collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"} ${isActive ? "bg-brand-100 text-brand-700 shadow-sm" : "text-brand-900 hover:bg-brand-100/70 hover:text-brand-700"}`
              }
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {!collapsed && (
                <span className="text-base font-medium tracking-tight">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}

          <button
            onClick={() => {
              clearUserInfo();
              localStorage.removeItem("access_token");
              navigate("/login");
            }}
            className={`group flex w-full items-center rounded-2xl transition-all duration-200 text-brand-900 hover:bg-red-50 hover:text-red-600 ${collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"}`}
          >
            <span className="text-lg leading-none">
              <LogoutOutlined />
            </span>
            {!collapsed && (
              <span className="text-base font-medium tracking-tight">
                Logout
              </span>
            )}
          </button>
        </div>
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex h-14 items-center justify-center border-t border-brand-100 bg-brand-700 text-white transition hover:bg-brand-800"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex  items-center justify-between border-b border-brand-100 shadow-sm bg-white px-6 py-3">
          <div className="relative w-full max-w-[320px]">
            <SearchOutlined className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-400" />
            <input
              type="text"
              placeholder="Tìm kiếm thể loại..."
              className="h-11 w-full rounded-2xl border border-brand-200 bg-white pl-11 pr-4 text-[15px] text-brand-900 outline-none transition placeholder:text-brand-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/15"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-full bg-brand-100 text-brand-700 shadow-inner border border-brand-100">
              {userInfo?.image ? (
                <img
                  src={userInfo.image}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserOutlined />
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-brand-700">
                {userInfo?.name || "Admin Master"}
              </p>
              <p className="text-[11px] uppercase tracking-widest text-brand-400">
                {userInfo?.email || "Super Admin"}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-white p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-brand-300">
            {location.pathname !== "/admin" && (
              <>
                <span>/</span>
                <span className="font-semibold text-brand-700">
                  {pageTitle}
                </span>
              </>
            )}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
