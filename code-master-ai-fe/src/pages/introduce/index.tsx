import { BookOpen, Code2, CheckCircle2, Brain, Zap } from "lucide-react";
import Footer from "../../components/footer";
import React, { useEffect } from "react";
import AnimateOnScroll from "../../utils/animateOnScroll";

const Introduce = () => {
  // Scroll to top khi component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // CORE VALUES DATA
  const values = [
    {
      icon: BookOpen,
      title: "Học theo lộ trình",
      desc: "Các khóa học được thiết kế bài bản từ cơ bản đến nâng cao.",
    },
    {
      icon: Code2,
      title: "Thực hành thực tế",
      desc: "Hơn 70% thời lượng là bài tập và dự án thực hành.",
    },
    {
      icon: CheckCircle2,
      title: "Chấm bài tự động",
      desc: "Hệ thống AI giúp đánh giá và phản hồi nhanh.",
    },
    {
      icon: Brain,
      title: "AI hỗ trợ 24/7",
      desc: "Trợ lý AI giải đáp mọi thắc mắc khi học.",
    },
  ];

  // STATS DATA
  const stats = [
    { number: "10,000+", label: "Học viên tin tưởng" },
    { number: "100+", label: "Khóa học chuyên sâu" },
    { number: "500+", label: "Bài tập thực hành" },
    { number: "24/7", label: "Hỗ trợ kỹ thuật" },
  ];

  // TEAM DATA
  const team = [
    {
      name: "Nguyễn Văn An",
      role: "Lead Fullstack Developer",
      icon: "👨‍💼",
    },
    { name: "Trần Thị Minh", role: "Data Scientist & AI Expert", icon: "👩‍💼" },
    { name: "Lê Hoàng Nam", role: "Mobile App Architect", icon: "👨‍💼" },
  ];

  return (
    <>
      <main className="bg-brand-25">
        {/* HERO SECTION */}
        <AnimateOnScroll>
        <section className="w-full py-12 md:py-20 bg-brand-25">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* LEFT CONTENT */}
              <div className="order-2 lg:order-1">
                <span className="inline-block bg-brand-50 text-brand-700 px-4 py-1 rounded-full text-sm font-semibold mb-4">
                  VỀ CHÚNG TÔI
                </span>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 mb-6">
                  Cách mạng hóa <br />
                  việc học{" "}
                  <span className="text-brand-600">Lập trình</span> <br />
                  với AI
                </h1>

                <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                  CodeMaster AI không chỉ là một nền tảng học tập trực tuyến thông
                  thường. Chúng tôi kết hợp lộ trình bài bản, bài tập thực hành
                  phong phú và sức mạnh của trí tuệ nhân tạo để cá nhân hóa hành
                  trình trở thành kỹ sư phần mềm của bạn.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button className="bg-brand-600 text-white px-6 md:px-8 py-3 rounded-full font-semibold hover:bg-brand-700 transition duration-200 shadow-sm">
                    Bắt đầu ngay
                  </button>
                  <button className="border-2 border-gray-300 text-gray-700 px-6 md:px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition duration-200">
                    Tìm hiểu thêm
                  </button>
                </div>
              </div>

              {/* RIGHT IMAGE */}
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=500&fit=crop"
                    className="rounded-2xl shadow-lg w-full h-auto object-cover"
                    alt="Học lập trình với AI"
                  />
                  <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <Zap size={16} className="text-yellow-500" />
                    <span className="text-sm font-semibold">24/7 Trợ lý ảo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        </AnimateOnScroll>

        {/* MISSION & VISION SECTION */}
        <AnimateOnScroll>
        <section className="w-full py-12 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* MISSION */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="mb-4">
                  <BookOpen size={32} className="text-brand-600" />
                </div>
                <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3">
                  Sứ mệnh
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Cung cấp nền tảng học lập trình chất lượng cao, dễ tiếp cận cho
                  mọi người thông qua công nghệ hiện đại. Chúng tôi tin rằng bất kì
                  ai cũng có thể trở thành lập trình viên giỏi nếu có phương pháp
                  học tập đúng đắn.
                </p>
              </div>

              {/* VISION */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="mb-4">
                  <Brain size={32} className="text-brand-600" />
                </div>
                <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3">
                  Tầm nhìn
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Trở thành hệ sinh thái đào tạo công nghệ hàng đầu ứng dụng AI tại
                  Việt Nam, kiến tạo thế hệ nhân sự chất lượng cao cho thị trường
                  toàn cầu.
                </p>
              </div>
            </div>
          </div>
        </section>
        </AnimateOnScroll>

        {/* CORE VALUES SECTION */}
        <section className="w-full py-12 md:py-20 bg-brand-25">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            {/* SECTION HEADER */}
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Giá trị cốt lõi
              </h2>
              <div className="w-12 h-1 bg-brand-600 mx-auto rounded-full"></div>
            </div>

            {/* VALUES GRID */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {values.map((item, i) => {
                const Icon = item.icon;
                return (
                  <AnimateOnScroll key={i}>
                  <div
                    className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition duration-200 text-center"
                  >
                    {/* ICON */}
                    <div className="mb-4 flex justify-center">
                      <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center">
                        <Icon size={28} className="text-brand-600" />
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <AnimateOnScroll>
        <section className="w-full bg-brand-600 text-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 text-center">
              {stats.map((item, i) => (
                <div key={i}>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                    {item.number}
                  </h3>
                  <p className="text-sm md:text-base text-white/80">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        </AnimateOnScroll>

        {/* TEAM SECTION */}
        <section className="w-full py-12 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            {/* SECTION HEADER */}
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Đội ngũ thành lập web
              </h2>
              <div className="w-12 h-1 bg-brand-600 mx-auto rounded-full"></div>
            </div>

            {/* TEAM GRID */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {team.map((member, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition duration-200"
                >
                  <div className="h-40 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                    <span className="text-5xl">{member.icon}</span>
                  </div>
                  <div className="p-6 text-center">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h4>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="w-full py-12 md:py-16 px-4 md:px-6 bg-brand-25">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-brand-600 to-brand-700 text-white text-center p-8 md:p-12 rounded-3xl shadow-lg">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Bạn đã sẵn sàng để trở thành Master?
            </h2>

            <p className="text-base md:text-lg text-white/90 mb-8">
              Bắt đầu hành trình học ngay hôm nay cùng CodeMaster AI
            </p>

            <button className="bg-white text-brand-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition duration-200 shadow-md">
              Bắt đầu học ngay
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Introduce;
