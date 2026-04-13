import React, { useEffect } from "react";
import { ShoppingCartOutlined , LoadingOutlined } from "@ant-design/icons";
import { GetCategoryNames } from "../../../data/course";
import { GetCourses } from "../../../api/course";
import { ICourse } from "../../../pages/course";
import AnimateOnScroll from "../../../utils/animateOnScroll";
import { useCourseStore } from "../../../store/course";
import { Empty} from "antd";
import { useNavigate } from "react-router-dom";

const HomeCourses = () => {
    const [selectedCategory, setSelectedCategory] = React.useState<string>("Tất cả");
    const [courses, setCourses] = React.useState<ICourse[]>([]);
    const [categories, setCategories] = React.useState<string[]>(["Tất cả"]);
    const { setGlobalCourses } = useCourseStore();
    const [loading, setLoading] = React.useState<boolean>(true);
    const navigate = useNavigate();
    const filteredCourses =
        selectedCategory === "Tất cả"
            ? courses.slice(0, 2)
            : courses.filter((course) => course.category.category_name === selectedCategory).slice(0, 2);

    useEffect(() => {
        const fetchdata = async () => {
            try {
                setLoading(true);
                const [coursesRes, categoryNames] = await Promise.all([
                    GetCourses(),
                    GetCategoryNames(),
                ]);
                setCourses(coursesRes.data);
                setGlobalCourses(coursesRes.data);
                setCategories(["Tất cả", ...categoryNames]);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchdata();
    }, []);

    return (
        <AnimateOnScroll>
            <div className="w-full py-10 sm:py-12 px-4 sm:px-8 lg:px-16 flex flex-col gap-6">

                {/* Title */}
                <div className="text-xl sm:text-2xl font-bold text-brand-700 text-center">
                    Tất cả khóa học
                </div>

                {/* Category pills */}
                <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
                    {categories.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedCategory(item)}
                            className={`text-gray-600 text-xs sm:text-sm w-fit font-bold rounded-full py-2 px-4 sm:px-5 cursor-pointer transition-colors duration-300
                                ${selectedCategory === item
                                    ? "bg-green-900 text-white hover:bg-green-900 cursor-not-allowed"
                                    : "bg-gray-100 hover:bg-gray-200"
                                }`}
                        >
                            {item}
                        </div>
                    ))}
                </div>

                {/* Course list */}
                {loading ? (
                    <div className="flex justify-center py-20"><LoadingOutlined className="text-4xl" /></div>
                ) : filteredCourses.length === 0 ? (
                    <div className="flex justify-center py-20"><Empty description="Không có kết quả tìm kiếm" /></div>
                ) : (
                    <div className="flex flex-col gap-4">

                        {filteredCourses.map((item, index) => (
                            <div
                                key={index}
                                className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0 border-b pb-4"
                            >
                                {/* Left */}
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                    <img
                                        src={item.thumbnail}
                                        alt={item.title}
                                        className="w-full sm:w-52 h-44 sm:h-24 object-cover rounded-lg"
                                    />
                                    <div className="flex flex-col gap-1 sm:gap-2">
                                        <div className="text-base sm:text-lg font-bold text-brand-600">
                                            {item.title}
                                        </div>
                                        <div className="text-xs sm:text-sm font-normal text-gray-500">
                                            {item.description}
                                        </div>
                                        <div className="text-xs font-normal text-gray-500">
                                            {`Level: ${item.level}`}
                                        </div>
                                    </div>
                                </div>

                                {/* Right */}
                                <div className="flex flex-row sm:flex-col lg:flex-row justify-between sm:justify-center lg:justify-end gap-3 sm:gap-4 items-center">
                                    <div className="text-base sm:text-lg font-bold text-brand-700">
                                        {item.price.toLocaleString("vi-VN")}đ
                                    </div>
                                    <button className="bg-brand-500 text-white py-2 px-4 rounded-lg hover:bg-brand-600 transition-colors duration-300">
                                        <ShoppingCartOutlined />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}


                {/* Load more */}
                <div className="flex justify-center">
                    <div onClick={() => navigate("/course")} className="text-sm sm:text-base font-bold text-brand-600 border border-2 rounded-full border-brand-600 px-4 py-2 cursor-pointer hover:bg-gray-100 hover:text-green-900 transition-colors duration-300">
                        Tải thêm khóa học
                    </div>
                </div>

            </div>
        </AnimateOnScroll>
    );
};

export default HomeCourses;