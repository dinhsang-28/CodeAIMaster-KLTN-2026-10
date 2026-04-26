import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";
import FloatingAiChat from "../components/AiChatConsultant";

const Layout = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
      <FloatingAiChat />
    </div>
  );
};

export default Layout;
