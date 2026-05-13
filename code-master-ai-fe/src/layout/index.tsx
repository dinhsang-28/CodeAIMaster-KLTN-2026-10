import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import FloatingAiChat from "../components/AiChatConsultant";
import AnimatedOutlet from "./AnimatedOutlet";

const Layout = () => {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/admin");

  return (
    <div>
      {!hideNavbar && <Navbar />}
      <AnimatedOutlet />
      <FloatingAiChat />
    </div>
  );
};

export default Layout;
