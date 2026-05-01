import { useInView } from 'react-intersection-observer';
import React from 'react';

// Định nghĩa props cho component
interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  // Các class CSS khi component chưa hiển thị
  defaultClasses?: string;
  // Các class CSS khi component đã hiển thị (lọt vào màn hình)
  inViewClasses?: string;
  // Ngưỡng (threshold) để kích hoạt (0.1 = 10% component hiển thị)
  threshold?: number;
  // Kích hoạt hiệu ứng chỉ một lần
  triggerOnce?: boolean;
}

const AnimateOnScroll: React.FC<Props> = ({
  children,
  defaultClasses = 'opacity-0 translate-y-10', // Mặc định: mờ và trượt lên
  inViewClasses = 'opacity-100 translate-y-0', // Mặc định: rõ và về vị trí 0
  className = '',
  threshold = 0.1,
  triggerOnce = true,
  ...props // Nhận các props khác như style, v.v.
}) => {
  const { ref, inView } = useInView({
    triggerOnce: triggerOnce, // Chỉ kích hoạt 1 lần
    threshold: threshold,     // Kích hoạt khi 10% phần tử hiển thị
  });

  // Đây là class transition để hiệu ứng mượt mà
  const transitionClass = 'transition-all duration-700 ease-out';

  return (
    <div
      ref={ref}
      // Kết hợp các class: layout, transition, và class điều kiện (hiển thị hoặc ẩn)
      className={`${className} ${transitionClass} ${inView ? inViewClasses : defaultClasses
        }`}
      {...props} // Truyền các props còn lại (ví dụ: style)
    >
      {children}
    </div>
  );
};

export default AnimateOnScroll;