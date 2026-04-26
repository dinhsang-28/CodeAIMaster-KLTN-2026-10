import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "../layout";
import Home from "../pages/home";
import Introduce from "../pages/introduce";
import Course from "../pages/course";
import Cart from "../pages/cart";
import Blog from "../pages/blog";
import CheckoutPage from "../pages/checkout";
import PurchaseHistoryContent from "../pages/purchase";
import AuthLayout from "../layout/authLayout";
import AuthForm from "../components/authForm";
import CourseDetailPage from "../pages/courseDetail";
import PaymentSuccessContent from "../pages/paymentSuccess";
import OrderDetailPage from "../pages/orderDetail";
import AdminLayout from "../layout/adminLayout";
import ArticleManage from "../pages/articleManage";
import CourseManage from "../pages/courseManage";
import ExerciseManage from "../pages/exerciseManage";
import UserManage from "../pages/admin/userManage";
import CategoryManage from "../pages/categoryManage";
import RevenueStatisticsPage from "../pages/revenueManage";
import GoogleAuthCallback from "../pages/auth/GoogleAuthCallback";
import LearnLayout from "../layout/LearnLayout";
import LessonPage from "../pages/lesson";
import Quizz from "../pages/quizz";
import GithubAuthCallback from "../pages/auth/GithubAuthCallback";
import ExercisePage from "../pages/lesson/excersite";
import RoleManage from "../pages/admin/roleManage";
import PermissionManage from "../pages/admin/permissionManage";
import ProfilePage from "../pages/ProfilePage";
import UserProfile from "../pages/profile";
import ChangePassword from "../pages/profile/ChangePassword";
import MyCourses from "../pages/profile/MyCourses";
import PersonalInfo from "../pages/profile/PersonalInfo";
import BlogDetail from "../pages/blogDetail";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/introduce",
        element: <Introduce />,
      },
      {
        path: "/blog",
        element: <Blog />,
      },
      {
        path: "/blog/:id",
        element: <BlogDetail />,
      },
      {
        path: "/course",
        element: <Course />,
      },
      {
        path: "/course/:id",
        element: <CourseDetailPage />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/checkout",
        element: <CheckoutPage />,
      },
      {
        path: "/history-order",
        element: <PurchaseHistoryContent />,
      },
      {
        path: "/payment-success/:orderId",
        element: <PaymentSuccessContent />,
      },
      {
        path: "/order-detail/:orderId",
        element: <OrderDetailPage />,
      },
      {
        path: "/profile",
        element: <UserProfile />, // chứa ProfileLayout + Outlet
        children: [
          {
            index: true,
            element: <PersonalInfo />, // /profile
          },
          {
            path: "password",
            element: <ChangePassword />, // /profile/password
          },
          {
            path: "courses",
            element: <MyCourses />, // /profile/courses
          },
        ],
      },
    ],
  },
  {
    path: "/learn",
    element: <LearnLayout />,
    children: [
      {
        path: "lesson/:id",
        element: <LessonPage />,
      },
      {
        path: "quiz/:id",
        element: <Quizz />,
      },
      {
        path: "exercise",
        element: <ExercisePage />,
      },
    ],
  },
  {
    path: "/register",
    element: (
      <AuthLayout>
        <AuthForm type="register" />
      </AuthLayout>
    ),
  },
  {
    path: "/login",
    element: (
      <AuthLayout>
        <AuthForm type="login" />
      </AuthLayout>
    ),
  },
  {
    path: "/auth/google/callback",
    element: (
      <AuthLayout>
        <GoogleAuthCallback />
      </AuthLayout>
    ),
  },
  {
    path: "/auth/github/callback",
    element: (
      <AuthLayout>
        <GithubAuthCallback />
      </AuthLayout>
    ),
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "/admin", element: <RevenueStatisticsPage /> },
      { path: "articles", element: <ArticleManage /> },
      { path: "courses", element: <CourseManage /> },
      { path: "exercises", element: <ExerciseManage /> },
      { path: "users", element: <UserManage /> },
      { path: "categories", element: <CategoryManage /> },
      { path: "roles", element: <RoleManage /> },
      { path: "permissions", element: <PermissionManage /> },
      {
        path: "profile",
        element: <ProfilePage />, // Component Profile ta vừa làm ở bước trước
      },
    ],
  },
]);
