import React, { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Modal, Card, Typography, Space, Dropdown, message, Tabs, Row, Col, Statistic } from 'antd';
import { MessageOutlined, PhoneOutlined, MailOutlined, DownOutlined, ClockCircleOutlined, CheckCircleOutlined, SyncOutlined, UserAddOutlined, FireOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { GetLeadsAdvisories, UpdateLeadStatus } from '../../../api/auth'; 
import PermissionControl from '../../../components/permissionControl';

const { Title, Text } = Typography;

interface Advisory {
  _id: string;
  contact_info: string;
  status: 'NEW' | 'CONTACTED' | 'RESOLVED';
  chat_history: string;
  createdAt: string;
  updatedAt: string;
  is_returning?: boolean; 
}

const timeAgo = (dateInput: string) => {
  const date = new Date(dateInput);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return "Vừa xong";
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<Advisory[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState('ALL'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0); 
  
  const [stats, setStats] = useState({ totalAll: 0, totalNew: 0, totalContacted: 0, totalResolved: 0 });
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentChatHistory, setCurrentChatHistory] = useState<string>('');
  const [currentContact, setCurrentContact] = useState<string>('');

  // 1. SỬ DỤNG useCallback VÀ BỎ THAM SỐ MẶC ĐỊNH
  const fetchLeads = useCallback(async (page: number, limit: number, tabStatus: string) => {
    setLoading(true);
    try {
      const res = await GetLeadsAdvisories(page, limit, tabStatus);
      if (res && res.success) {
        setLeads(res.data); 
        setTotalItems(res.meta.totalItems); 
        if (res.meta.stats) {
          setStats(res.meta.stats);
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách:', error);
    } finally {
      setLoading(false);
    }
  }, []); // Mảng dependency rỗng vì hàm không còn phụ thuộc vào state bên ngoài

  // 2. useEffect CHUẨN CHỈ, KHÔNG BỊ CẢNH BÁO
  useEffect(() => {
    fetchLeads(1, 10, 'ALL');
  }, [fetchLeads]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrentPage(1);
    fetchLeads(1, pageSize, key);
  };

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    fetchLeads(pagination.current, pagination.pageSize, activeTab);
  };

  const handleStatusChange = async (leadId: string, newStatus: 'NEW' | 'CONTACTED' | 'RESOLVED') => {
    try {
      const res = await UpdateLeadStatus(leadId, newStatus);
      if (res && res.success) {
        message.success('Đã cập nhật trạng thái khách hàng!');
        // 3. TRUYỀN RÕ THAM SỐ VÀO ĐÂY
        fetchLeads(currentPage, pageSize, activeTab); 
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const showChatModal = (history: string, contact: string) => {
    setCurrentChatHistory(history);
    setCurrentContact(contact);
    setIsModalVisible(true);
  };

  const statusConfig = {
    NEW: { text: 'MỚI', color: 'red', icon: <ClockCircleOutlined />, textColor: '#f5222d' },
    CONTACTED: { text: 'ĐANG TRAO ĐỔI', color: 'orange', icon: <SyncOutlined spin />, textColor: '#fa8c16' },
    RESOLVED: { text: 'ĐÃ CHỐT', color: 'green', icon: <CheckCircleOutlined />, textColor: '#52c41a' },
  };

  const columns = [
    {
      title: 'Hoạt động cuối',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: '15%',
      render: (date: string) => (
        <div>
          <div className="text-gray-800 font-bold">{timeAgo(date)}</div>
          <div className="text-gray-400 text-[11px]">{new Date(date).toLocaleDateString('vi-VN')}</div>
        </div>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'contact_info',
      key: 'contact_info',
      width: '30%',
      render: (text: string, record: Advisory) => {
        const isEmail = text.includes('@');
        return (
          <div>
            <Space className="font-bold text-brand-800 text-[15px] mb-1">
              {isEmail ? <MailOutlined className="text-gray-400" /> : <PhoneOutlined className="text-gray-400" />}
              {text}
            </Space>
            <br/>
            {record.is_returning ? (
              <Tag color="purple" className="border-none font-bold text-[10px] rounded-sm">KHÁCH CŨ (QUAY LẠI)</Tag>
            ) : (
              <Tag color="blue" className="border-none font-bold text-[10px] rounded-sm">KHÁCH MỚI</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '25%',
      render: (status: 'NEW' | 'CONTACTED' | 'RESOLVED', record: Advisory) => {
        const config = statusConfig[status];
        const menuItems: MenuProps['items'] = (['NEW', 'CONTACTED', 'RESOLVED'] as const).map(key => ({
          key,
          label: (
            <Space className="py-1">
              <span style={{ color: statusConfig[key].color }}>{statusConfig[key].icon}</span>
              <span className="font-semibold text-[13px]" style={{ color: statusConfig[key].textColor }}>{statusConfig[key].text}</span>
            </Space>
          ),
          onClick: () => handleStatusChange(record._id, key),
          disabled: key === status,
          className: key === status ? 'bg-gray-50' : ''
        }));

        return (
            <PermissionControl permission="leads_edit">
          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomLeft">
            <Tag color={config.color} icon={config.icon} className="px-3 py-1 rounded-full font-bold text-[12px] cursor-pointer hover:opacity-80 flex items-center gap-1.5 w-fit border-none shadow-sm">
              {config.text} <DownOutlined className="text-[10px] opacity-60 ml-0.5" />
            </Tag>
          </Dropdown>
          </PermissionControl>
        );
      },
    },
    {
      title: 'Nội dung',
      key: 'action',
      width: '15%',
      render: (_: any, record: Advisory) => (
        <Button type="primary" ghost icon={<MessageOutlined />} onClick={() => showChatModal(record.chat_history, record.contact_info)} className="border-brand-600 text-brand-600 hover:!bg-brand-50 rounded-full">
          Xem Chat
        </Button>
      ),
    },
  ];

  const formatChatHistory = (history: string) => {
    if (!history) return <Text type="secondary">Không có lịch sử ghi nhận.</Text>;
    const lines = history.split(' | ');
    return lines.map((line, index) => {
      const isUser = line.toLowerCase().startsWith('user:');
      const textContent = line.replace(/^(user|model):\s*/i, '');
      return (
        <div key={index} className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] rounded-xl px-4 py-2 text-[14px] shadow-sm ${isUser ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
            <span className="font-bold block text-[11px] mb-1 opacity-60 uppercase">{isUser ? 'Khách hàng' : 'AI Tư vấn'}</span>
            {textContent}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#f8fafc] min-h-screen">
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card className="rounded-2xl shadow-sm border-gray-100">
            <Statistic title={<span className="font-bold text-gray-500">TỔNG KHÁCH</span>} value={stats.totalAll} prefix={<UserAddOutlined className="text-brand-600" />} />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card className="rounded-2xl shadow-sm border-red-100 bg-red-50">
            <Statistic title={<span className="font-bold text-red-500">CẦN XỬ LÝ</span>} value={stats.totalNew} prefix={<FireOutlined className="text-red-500" />} valueStyle={{ color: '#ef4444', fontWeight: 'bold' }} />
          </Card>
        </Col>

        <Col span={6}>
          <Card className="rounded-2xl shadow-sm border-orange-100 bg-orange-50">
            <Statistic title={<span className="font-bold text-orange-500">ĐANG TƯ VẤN</span>} value={stats.totalContacted} prefix={<SyncOutlined spin className="text-orange-500" />} valueStyle={{ color: '#f97316', fontWeight: 'bold' }} />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card className="rounded-2xl shadow-sm border-[#e6f7ff] bg-[#f6ffed]">
            <Statistic title={<span className="font-bold text-[#52c41a]">ĐÃ CHỐT</span>} value={stats.totalResolved} prefix={<CheckCircleOutlined className="text-[#52c41a]" />} valueStyle={{ color: '#52c41a', fontWeight: 'bold' }} />
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm rounded-2xl border border-gray-100">
        <div className="mb-4 flex justify-between items-center">
          <Title level={4} className="!mb-0 !text-brand-800 font-extrabold">Danh sách Yêu cầu Tư vấn</Title>
          {/* 4. TRUYỀN RÕ THAM SỐ KHI BẤM NÚT LÀM MỚI */}
          <Button onClick={() => fetchLeads(currentPage, pageSize, activeTab)} loading={loading} className="rounded-full">Làm mới</Button>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          items={[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'NEW', label: <span className="text-red-500 font-bold">Chờ xử lý</span> },
            { key: 'CONTACTED', label: <span className="text-orange-500 font-medium">Đang tư vấn</span> },
            { key: 'RESOLVED', label: <span className="text-[#52c41a] font-bold">Đã chốt</span> },
          ]}
        />

        <Table 
          columns={columns} 
          dataSource={leads} 
          rowKey="_id" 
          loading={loading}
          onChange={handleTableChange}
          pagination={{ 
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
        />
      </Card>

      <Modal
        title={
          <div>
            <span className="text-gray-500 font-normal">Lịch sử trò chuyện của: </span>
            <span className="text-brand-700 font-bold">{currentContact}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[<Button key="close" onClick={() => setIsModalVisible(false)} className="rounded-full">Đóng</Button>]}
        width={600}
      >
        <div className="mt-4 max-h-[400px] overflow-y-auto bg-white p-2">
          {formatChatHistory(currentChatHistory)}
        </div>
      </Modal>
    </div>
  );
}