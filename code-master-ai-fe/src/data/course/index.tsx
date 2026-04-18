import { GetCategories } from "../../api/course";

export type CourseLevel = 'Cơ bản' | 'Trung bình' | 'Nâng cao';

export type CourseCategory = 'AI & Data' | 'Frontend' | 'Backend' | 'Mobile' | 'Cybersecurity';

export interface Course  {
  id: number;
  title: string;
  description: string;
  lessons: number;
  duration: string;
  level: CourseLevel;
  rating: number;
  reviews: number;
  category: CourseCategory;
  image: string;
  price: string;
  originalPrice?: string;
  isFree?: boolean;
  ctaLabel: string;
};

export const GetCategoryNames = async (): Promise<CourseCategory[]> => {
  const categories = await GetCategories();
  return categories.map((category) => category.category_name as CourseCategory);
};
export const courses: Course[] = [
  {
    id: 1,
    title: 'Nhập môn Machine Learning cơ bản',
    description:
      'Tìm hiểu các thuật toán học máy phổ biến nhất hiện nay thông qua các dự án thực tế.',
    lessons: 24,
    duration: '12.5h',
    level: 'Cơ bản',
    rating: 4.5,
    reviews: 128,
    category: 'AI & Data',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDAjHKflROAWi5Vj-xhe95QW5Bu-1EfwVKBTOp8jQj23TIyvDerhgJhgvV_WnDVJhXKqjTsz4FChBMqhtTAxigb59rzSQ8sTL4dspDzXRN3sr83BcnKiyM43XDJFnXuMb8YO5IEMFr6btZT5z-nNukCArieZS-O4J41v9c9a7XRMy-m0TNl1c86IvPq-YtJOivjnpSck6hJtHxMDZs1exZNlCHan8p3NJysov-opS-uC4mbJ1wjjMwG96Aw0EFT-MJF9iPyaZ4s6csh',
    price: '549.000đ',
    originalPrice: '899.000đ',
    ctaLabel: 'Xem',
  },
  {
    id: 2,
    title: 'Xây dựng ứng dụng với React & Tailwind',
    description:
      'Làm chủ React v18 và Tailwind CSS để xây dựng giao diện chuyên nghiệp.',
    lessons: 48,
    duration: '22.0h',
    level: 'Trung bình',
    rating: 5,
    reviews: 256,
    category: 'Frontend',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAgUDwU_qGU0_I8WaeVXk3KJ-kBRilkg3BJF8Zt3TT6Gup9zS4HxWjAANYXaSjAvl2ZKKntenqDVb976orxFv3WD4SjmWXA_ZMjZxEERNLxKBPchNI4FQyCMD6s5ufg835VSav13XmLUrXSeO6wTxjYOrGRxQBjQ-SLXoTlM9uhayFamzmfMcLROuQcj2qCPZqvfL5CguAApbwyOZhPogWw-FcSoYgnaR2YQs2gREN-0PHt5CXnV6KL6jfaDeSYXiLkUgz3Yd2GSfE9',
    price: 'Miễn phí',
    isFree: true,
    ctaLabel: 'Học ngay',
  },
  {
    id: 3,
    title: 'Node.js và Microservices Nâng cao',
    description:
      'Tối ưu hóa hiệu năng hệ thống với kiến trúc Microservices và Docker.',
    lessons: 32,
    duration: '18.5h',
    level: 'Nâng cao',
    rating: 5,
    reviews: 92,
    category: 'Backend',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAiK9_e88GohgcT1j3TrliMHjw_MCzvlYbWThILJJihwNZi1OVXh3JDebjHecVGHEA-8Bf4LQrR9y5oumlzC8IyeEHi_5r1j69suZYZtbHAL8fZBn_JU0V62yjM_cHu6CameLsRNPmbz71VBw7WtBBpDUeBqopb-KnXYWZ3tXhMWBS_Kj66z1uH6DA9MA5l9okW0nhFL6ZAGOTYpac57n3K74omn1UggYhYXho2gVWcmiyOvwKdNMdostk143MajwHWmHtxLFa424nl',
    price: '1.299.000đ',
    ctaLabel: 'Xem',
  },
  {
    id: 4,
    title: 'Phân tích dữ liệu với Python và SQL',
    description:
      'Thao tác dữ liệu chuyên nghiệp với Pandas, NumPy và truy vấn SQL tối ưu.',
    lessons: 40,
    duration: '25.0h',
    level: 'Cơ bản',
    rating: 4.5,
    reviews: 210,
    category: 'AI & Data',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBLN0TzyQBOdHpg_45Iif9j9hMB4mFwcZ8Azu-UeWqRnk_hYqy_OWM2vtdsFKDg9oCXZCORx2JaB8Xpv4GAQniHnVpzAN0arDFj6YamNC-dvCSLJeN2q3A_6ncPTNiXhHXfME5eCQa6ggAIdpc_Byb7KPpT3w9O8VbMItn0wiHdO-YnE2_lhU1b58zmwaNZoZBfJLtB-vRJx4ankbjmqraZE9jQz_ToTt71he1a0MjqLgv5qDbrkNV93WlehC_qjl_faRklfbj4RRlz',
    price: '790.000đ',
    originalPrice: '1.500.000đ',
    ctaLabel: 'Xem',
  },
];

export const getCategoryBadgeClass = (category: CourseCategory) => {
  switch (category) {
    case 'Frontend':
      return 'bg-brand-200 text-brand-900';
    case 'Backend':
      return 'bg-brand-700 text-white';
    case 'AI & Data':
      return 'bg-brand-400 text-white';
    case 'Mobile':
      return 'bg-brand-300 text-brand-900';
    case 'Cybersecurity':
      return 'bg-brand-600 text-white';
    default:
      return 'bg-brand-400 text-white';
  }
};