import React from "react";
import { BookOpen, Pencil, HelpCircle, Code } from "lucide-react";
import AnimateOnScroll from "../../../utils/animateOnScroll";

interface FeatureItem {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
}

const featureList: FeatureItem[] = [
    {
        id: 1,
        title: "Bài học",
        description: "Video bài giảng chất lượng cao, súc tích và dễ hiểu.",
        icon: <BookOpen size={20} />,
    },
    {
        id: 2,
        title: "Bài tập",
        description: "Hệ thống bài tập vận dụng ngay sau mỗi kiến thức mới.",
        icon: <Pencil size={20} />,
    },
    {
        id: 3,
        title: "Quiz",
        description: "Kiểm tra nhanh kiến thức để củng cố nền tảng vững chắc.",
        icon: <HelpCircle size={20} />,
    },
    {
        id: 4,
        title: "Thực hành Code",
        description: "Code trực tiếp trên trình duyệt với sự hỗ trợ của AI.",
        icon: <Code size={20} />,
    },
];

const HomeRoute = () => {
    return (
        <AnimateOnScroll>
            <div id="tour-home-route" className="bg-brand-50 py-10 sm:py-12 px-4 sm:px-8 flex flex-col gap-8 sm:gap-12">

                {/* Header */}
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <div className="text-xl sm:text-2xl text-brand-700 font-bold max-w-xs sm:max-w-sm">
                        Lộ trình học tập chuyên nghiệp
                    </div>
                    <div className="text-xs sm:text-sm font-normal text-gray-600 max-w-xs sm:max-w-md text-center">
                        Chúng tôi xây dựng quy trình học khép kín giúp bạn không chỉ hiểu lý thuyết mà còn
                        thành thạo kỹ năng thực hành.
                    </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-0 sm:px-4">
                    {featureList.map((item, index) => (
                        <div
                            key={index}
                            className="flex flex-col bg-white rounded-3xl px-8 sm:px-10 lg:px-14 py-8 sm:py-10 items-center text-center cursor-pointer transform transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-lg"
                        >
                            <div className="rounded-full mb-4 sm:mb-6 text-brand-700 bg-brand-25 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                                {item.icon}
                            </div>
                            <div className="text-base sm:text-lg font-semibold text-brand-700">
                                {`${item.id}. ${item.title}`}
                            </div>
                            <div className="text-sm sm:text-base text-gray-600 mt-1">
                                {item.description}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </AnimateOnScroll>
    );
};

export default HomeRoute;