import React from "react";
import Navbar from "../components/navbar";
import FloatingAiChat from "../components/AiChatConsultant";
import AnimatedOutlet from "./AnimatedOutlet";

const Layout = () => {
  return (
    <div>
      <Navbar />
      <AnimatedOutlet />
      <FloatingAiChat />
    </div>
  );
};

export default Layout;
