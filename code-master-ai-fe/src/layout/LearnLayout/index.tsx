import Sidebar from "../../pages/lesson/sidebar";
import { lessons } from "../../pages/lesson/fakeData";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/navbar";

const LearnLayout = () => {
  return (
    <>
      <Navbar />

      <div className="bg-gray-100 min-h-screen flex">
        {/* SIDEBAR */}
        <Sidebar data={lessons} />

        {/* CONTENT */}
        <div className="flex-1 p-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default LearnLayout;