import { axiosInstance } from "../../utils/axios";
export interface ICourse {
  _id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  thumbnail: string;
  status: string;
  category: {
    _id: string;
    category_name: string;
  };
}

export const getMyCourses = async () => {
  const res = await axiosInstance.get("/courses/myCourses");
  return res.data?.data || res.data;
};
