import React, { useEffect, useState, useCallback } from 'react';
import { Table, Card, Typography, Space, Input, Tag, Button, Popconfirm, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, ReloadOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { GetStudentsList, ToggleStudentStatus } from '../../../api/admin/user'; // Nhớ trỏ đúng đường dẫn
import PermissionControl from '../../../components/permissionControl';

const { Title, Text } = Typography;
const { Search } = Input;
interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  isActive: boolean;
  status: 'active' | 'banned'; // Trạng thái khóa tài khoản
  createdAt: string;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchText, setSearchText] = useState('');

  const fetchStudents = useCallback(async (page: number, limit: number, search: string) => {
    setLoading(true);
    try {
      const res = await GetStudentsList(page, limit, search);
      if (res && res.results) {
        setStudents(res.results);
        setTotalItems(res.meta.total); 
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách học viên:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents(1, 10, '');
  }, [fetchStudents]);

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    fetchStudents(pagination.current, pagination.pageSize, searchText);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1); 
    fetchStudents(1, pageSize, value);
  };

  const handleReset = () => {
    setSearchText('');
    setCurrentPage(1);
    fetchStudents(1, pageSize, '');
  };
  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    setLoading(true);
    try {
      const newStatus = currentStatus === 'active' ? 'banned' : 'active';
      const res = await ToggleStudentStatus(userId, newStatus);
      
      if (res && res.success) {
        message.success(res.message);
        // Refresh lại danh sách trang hiện tại
        fetchStudents(currentPage, pageSize, searchText); 
      }
    } catch (error: any) {
      // Bắt lỗi từ Backend trả về (Ví dụ: Lỗi không thể khóa Quản trị viên)
      message.error(error.response?.data?.message || 'Lỗi khi thay đổi trạng thái!');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Học viên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Student) => (
        <Space>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-bold">
            {record.image ? (
              <img src={record.image} alt="avatar" className="h-full w-full rounded-full object-cover" />
            ) : (
              <UserOutlined />
            )}
          </div>
          <span className="font-bold text-gray-800">{text}</span>
        </Space>
      ),
    },
    {
      title: 'Thông tin liên hệ',
      key: 'contact',
      render: (_: any, record: Student) => (
        <div>
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <MailOutlined className="text-gray-400" /> {record.email}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <PhoneOutlined className="text-gray-400" /> {record.phone || <Text type="secondary" className="italic">Chưa cập nhật</Text>}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <Text className="font-medium text-gray-600">
          {new Date(date).toLocaleDateString('vi-VN')}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: Student) => {
        // Ưu tiên 1: Nếu bị Ban, hiện màu đỏ cảnh báo BỊ KHÓA
        if (record.status === 'banned') {
          return <Tag color="error" className="border-none font-bold px-3 py-1 rounded-full">BỊ KHÓA</Tag>;
        }
        // Ưu tiên 2: Nếu chưa bị Ban, xét xem đã kích hoạt Email chưa
        return record.isActive 
          ? <Tag color="green" className="border-none font-bold px-3 py-1 rounded-full">ĐÃ KÍCH HOẠT</Tag>
          : <Tag color="warning" className="border-none font-bold px-3 py-1 rounded-full">CHƯA XÁC THỰC</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Student) => {
        const isBanned = record.status === 'banned';
        
        return (
        <PermissionControl permission="students_edit">
          <Popconfirm
            title={isBanned ? "Mở khóa học viên này?" : "Khóa học viên này?"}
            description={isBanned ? "Học viên sẽ có thể đăng nhập trở lại." : "Học viên sẽ bị văng ra khỏi hệ thống và không thể đăng nhập."}
            onConfirm={() => handleToggleStatus(record._id, record.status || 'active')}
            okText="Đồng ý"
            cancelText="Hủy"
            okButtonProps={{ danger: !isBanned }}
          >
            <Button 
              type={isBanned ? "default" : "primary"} 
              danger={!isBanned}
              icon={isBanned ? <UnlockOutlined className="text-green-500" /> : <LockOutlined />}
              className={isBanned ? "border-green-500 text-green-500 hover:!text-green-600 hover:!border-green-600 rounded-full" : "rounded-full"}
            >
              {isBanned ? 'Mở khóa' : 'Khóa'}
            </Button>
          </Popconfirm>
          </PermissionControl>
        );
      },
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#f8fafc] min-h-screen">
      <Card className="shadow-sm rounded-2xl border border-gray-100">
        
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Title level={4} className="!mb-1 !text-brand-800 font-extrabold">Danh sách Học viên</Title>
            <Text type="secondary">Quản lý các tài khoản có vai trò là người học.</Text>
          </div>
          
          <Space>
            {/* Thanh tìm kiếm không có enterButton để mất màu xanh nền */}
            <Search
              placeholder="Tìm theo Tên hoặc Email..."
              allowClear
              size="large"
              onSearch={handleSearch}
              className="w-full sm:w-[300px]"
            />
            <Button size="large" icon={<ReloadOutlined />} onClick={handleReset} />
          </Space>
        </div>

        <Table 
          columns={columns} 
          dataSource={students} 
          rowKey="_id" 
          loading={loading}
          onChange={handleTableChange}
          pagination={{ 
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total) => `Tổng cộng ${total} học viên`, 
          }}
        />
        
      </Card>
    </div>
  );
}