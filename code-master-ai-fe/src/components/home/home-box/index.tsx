import React from "react";
import { useNavigate } from "react-router-dom";
import AnimateOnScroll from "../../../utils/animateOnScroll";

type CTASectionProps = {
    title?: string;
    description?: string;
    primaryText?: string;
    secondaryText?: string;
    onPrimaryClick?: () => void;
    onSecondaryClick?: () => void;
};

export default function CTASection({
    title = "Tham gia ngay hôm nay",
    description = "Bắt đầu hành trình chinh phục code và mở ra cơ hội nghề nghiệp không giới hạn trong kỷ nguyên AI.",
    primaryText = "Đăng ký ngay",
    secondaryText = "Tư vấn lộ trình",
    onPrimaryClick,
    onSecondaryClick,
}: CTASectionProps) {
    const navigate = useNavigate();

    const handlePrimaryClick = () => {
        if (onPrimaryClick) {
            onPrimaryClick();
        } else {
            navigate("/register");
        }
    };

    return (
        <AnimateOnScroll>
            <section className="bg-brand-25 py-10 sm:py-12 md:py-16">
                <div className="mx-auto max-w-5xl px-4">
                    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 px-6 py-12 sm:py-16 md:py-20 text-center shadow-sm md:px-10">

                        {/* Background accents */}
                        <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-brand-700/20 blur-3xl" />
                        <div className="absolute bottom-0 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />

                        <div className="relative mx-auto max-w-3xl">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                                {title}
                            </h2>

                            <p className="mx-auto mt-4 sm:mt-5 max-w-2xl text-base sm:text-lg leading-8 text-brand-50/90">
                                {description}
                            </p>

                            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                                <button
                                    type="button"
                                    onClick={handlePrimaryClick}
                                    className="w-full sm:w-auto min-w-[190px] rounded-full bg-white px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-brand-600 shadow-lg shadow-brand-900/10 transition hover:-translate-y-0.5 hover:bg-brand-25"
                                >
                                    {primaryText}
                                </button>

                                <button
                                    type="button"
                                    onClick={onSecondaryClick}
                                    className="w-full sm:w-auto min-w-[190px] rounded-full border border-white/20 bg-brand-700/20 px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-brand-700/30"
                                >
                                    {secondaryText}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </AnimateOnScroll>
    );
}