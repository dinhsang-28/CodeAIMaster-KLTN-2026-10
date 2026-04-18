import React from "react";
import { Layout, Row, Col } from "antd";
import ProfileSidebar from "../../components/ProfileSidebar";

const { Content } = Layout;

interface Props {
  children: React.ReactNode;
  activeMenu: string;
  setActiveMenu: (key: string) => void;
}

const ProfileLayout: React.FC<Props> = ({ children, activeMenu, setActiveMenu }) => {
  return (
    <Layout style={{ background: "#f5f4ee", minHeight: "100vh" }}>
      <Content style={{ padding: "28px 24px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        <Row gutter={24} align="top">
          <Col xs={24} md={7}>
            <ProfileSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
          </Col>
          <Col xs={24} md={17}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: "#999", cursor: "pointer" }}>Trang chủ</span>
              <span style={{ fontSize: 12, color: "#bbb" }}>›</span>
              <span style={{ fontSize: 12, color: "#3d6b4a" }}>Hồ sơ</span>
            </div>
            {children}
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default ProfileLayout;