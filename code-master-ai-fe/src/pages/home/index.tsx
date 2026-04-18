import React, { useEffect } from "react";
import HomeBaner from "../../components/home/home-banner";
import FeaturedCourses from "../../components/home/featured courses";
import HomeCourses from "../../components/home/home-courses";
import HomeRoute from "../../components/home/home-route";
import HomeNews from "../../components/home/home-news";
import CTASection from "../../components/home/home-box";
import Footer from "../../components/footer";
import { useUserInfo } from "../../store/user";

const Home = () => {
  // Scroll to top khi component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { userInfo } = useUserInfo();

  return (
    <div className="">
      <HomeBaner />
      <FeaturedCourses />
      <HomeCourses />
      <HomeRoute />
      <HomeNews />
      {userInfo ? <></> : <CTASection />}
      <Footer />
    </div>
  );
};

export default Home;
