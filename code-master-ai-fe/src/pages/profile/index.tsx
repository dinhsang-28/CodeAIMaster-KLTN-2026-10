import React, { useState } from "react";
import ProfileLayout from "../../layout/userProfileLayout";
import PersonalInfo from "./PersonalInfo";
import ChangePassword from "./ChangePassword";
import MyCourses from "./MyCourses";

const UserProfile = () => {
  const [activeMenu, setActiveMenu] = useState("personal-info");

  const renderContent = () => {
    switch (activeMenu) {
      case "personal-info":
        return <PersonalInfo />;
      case "password":
        return <ChangePassword />;
      case "my-courses":
        return <MyCourses />;
      default:
        return <PersonalInfo />;
    }
  };

  return (
    <ProfileLayout
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
    >
      {renderContent()}
    </ProfileLayout>
  );
};

export default UserProfile;