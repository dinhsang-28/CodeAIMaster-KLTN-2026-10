import Sidebar from "../../pages/lesson/sidebar";
import { lessons } from "../../pages/lesson/fakeData";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/navbar";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const LearnLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 lg:p-6 items-start">

      {/* Hiển thị trên mobile */}
      <div className="lg:hidden w-full flex items-center gap-2 mb-2">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition"
        >
          {sidebarOpen ? (
            <X size={20} className="text-brand-600" />
          ) : (
            <Menu size={20} className="text-brand-600" />
          )}
          <span className="text-sm font-semibold text-brand-600">
            {sidebarOpen ? "Đóng" : "Menu"}
          </span>
        </button>
      </div>

      {/* Desktop*/}
      <div className="hidden lg:block lg:w-1/4 lg:min-w-[300px] sticky top-20">
        <Sidebar data={lessons} />
      </div>

      {/* Mobile */}
      {sidebarOpen && (
        <>
          {/* BACKDROP */}
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-40 top-[76px]"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* SIDEBAR OVERLAY */}
          <div className="lg:hidden fixed left-0 top-[76px] h-[calc(100vh-76px)] w-4/5 max-w-xs bg-white shadow-lg z-50 overflow-y-auto">
            <div className="p-4">
              <Sidebar data={lessons} />
            </div>
          </div>
        </>
      )}

      {/* CONTENT */}
      <div className="w-full lg:flex-1">

        <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm">
          <Outlet />
        </div>

      </div>

      </div>
    </>
  );
};

export default LearnLayout;
