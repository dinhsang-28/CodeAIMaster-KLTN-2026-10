import React from 'react';
import { useUserInfo } from '../../store/user'; 

interface PermissionControlProps {
  permission: string;
  children: React.ReactNode;
}

const PermissionControl: React.FC<PermissionControlProps> = ({ permission, children }) => {
  // Lấy userInfo từ store của 
  const userInfo = useUserInfo((state) => state.userInfo);
  
  // Nếu chưa đăng nhập hoặc không có quyền trong mảng Ẩn element đi
  if (!userInfo?.permissions?.includes(permission)) {
    return null;
  }

  return <>{children}</>;
};

export default PermissionControl;