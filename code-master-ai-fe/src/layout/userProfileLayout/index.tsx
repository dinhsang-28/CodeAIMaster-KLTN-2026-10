import React from "react";
import { Layout } from "antd";

const { Content } = Layout;

interface Props {
  children: React.ReactNode;
}

const ProfileLayout: React.FC<Props> = ({ children }) => {
  return (
    <Layout style={{ background: "#f5f4ee", minHeight: "100vh" }}>
      <Content
        style={{
          padding: "28px 24px",
          maxWidth: 1100,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}
        >
          <span style={{ fontSize: 12, color: "#999", cursor: "pointer" }}>
            Trang chủ
          </span>
          <span style={{ fontSize: 12, color: "#bbb" }}>›</span>
          <span style={{ fontSize: 12, color: "#3d6b4a" }}>Hồ sơ</span>
        </div>
        {children}
      </Content>
    </Layout>
  );
};

export default ProfileLayout;
