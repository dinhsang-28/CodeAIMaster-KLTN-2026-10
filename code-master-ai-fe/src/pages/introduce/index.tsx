import { BookOpen, Code2, CheckCircle2, Brain, Zap } from "lucide-react";
import Footer from "../../components/footer";
import React, { useEffect, useState } from "react";
import AnimateOnScroll from "../../utils/animateOnScroll";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

type NumericStat = {
  kind: "num";
  label: string;
  value: number;
  suffix: string;
};
type TextStat = { kind: "text"; label: string; value: string };
type StatRow = NumericStat | TextStat;

const INTRO_STATS: StatRow[] = [
  { kind: "num", label: "Học viên tin tưởng", value: 10000, suffix: "+" },
  { kind: "num", label: "Khóa học chuyên sâu", value: 100, suffix: "+" },
  { kind: "num", label: "Bài tập thực hành", value: 500, suffix: "+" },
  { kind: "text", label: "Hỗ trợ kỹ thuật", value: "24/7" },
];

const IntroStatTile = ({ stat }: { stat: StatRow }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);
  const [freezeStatic, setFreezeStatic] = useState(false);

  useEffect(() => {
    if (!inView || stat.kind !== "num") return;
    const target = stat.value;
    const duration = 1600;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.floor(target * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
        setDone(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, stat]);

  useEffect(() => {
    if (stat.kind !== "num" || !done) return;
    const timer = window.setTimeout(() => {
      setFreezeStatic(true);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [done, stat]);

  if (stat.kind === "text") {
    return (
      <div ref={ref} className="flex flex-col items-center text-center gap-2">
        <motion.div
          className="text-2xl sm:text-3xl md:text-4xl font-black tabular-nums mb-2"
          animate={
            inView ? { rotate: [0, 8, -8, 5, -5, 0], y: [0, -12, 2, -4, 0] } : {}
          }
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {stat.value}
        </motion.div>
        <p className="text-sm md:text-base text-white/85">{stat.label}</p>
      </div>
    );
  }

  if (freezeStatic) {
    return (
      <div ref={ref} className="flex flex-col items-center text-center gap-2">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 tabular-nums">
          {display.toLocaleString("vi-VN")}
          {stat.suffix}
        </h3>
        <p className="text-sm md:text-base text-white/85">{stat.label}</p>
      </div>
    );
  }

  return (
    <div ref={ref} className="flex flex-col items-center text-center gap-2">
      <motion.h3
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 tabular-nums"
        animate={
          done
            ? { rotate: 0, y: 0, scale: 1 }
            : inView
              ? { rotate: [0, 2.5, -2.5, 0], y: [0, -3, 0] }
              : {}
        }
        transition={
          done ? { duration: 0.2 } : { duration: 0.38, repeat: Infinity }
        }
      >
        <motion.span
          animate={
            done
              ? {
                  scale: [1, 1.22, 0.92, 1.06, 1],
                  y: [0, -26, 8, -5, 0],
                  rotate: [0, -5, 4, -2, 0],
                }
              : { rotate: 0, y: 0, scale: 1 }
          }
          transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          {display.toLocaleString("vi-VN")}
          {stat.suffix}
        </motion.span>
      </motion.h3>
      <p className="text-sm md:text-base text-white/85">{stat.label}</p>
    </div>
  );
};

const Introduce = () => {
  const navigate = useNavigate();
  const [showExtraIntro, setShowExtraIntro] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const team = [
    {
      name: "Thành viên thứ 1 — điền tên",
      role: "",
      icon: "👤",
    },
    {
      name: "Thành viên thứ 2 — điền tên",
      role: "",
      icon: "👤",
    },
    {
      name: "Thành viên thứ 3 — điền tên",
      role: "",
      icon: "👤",
    },
    {
      name: "Thành viên thứ 4 — điền tên",
      role: "",
      icon: "👤",
    },
    {
      name: "Thành viên thứ 5 — điền tên",
      role: "",
      icon: "👤",
    },
  ];

  return (
    <>
      <main className="bg-brand-25">
        <AnimateOnScroll>
          <section className="w-full py-12 md:py-20 bg-brand-25">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
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

                  {showExtraIntro && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="mb-8 rounded-2xl border border-brand-100 bg-white/85 px-5 py-5 md:px-8 md:py-6 text-gray-600 text-sm md:text-base leading-relaxed max-w-xl shadow-sm space-y-4"
                    >
                      <p>
                        Để làm được điều đó, chúng tôi luôn ưu tiên trải nghiệm học:
                        ví dụ bài học được chẻ nhỏ theo chủ đề, có checkpoint kiểm
                        tra và gợi ý chỉnh sửa từ AI giúp bạn hiểu sâu hơn từng bước.
                      </p>
                      <p>
                        Nền tảng cũng được thiết kế để bạn không “học vẹt”: mọi khóa
                        đều gắn với ví dụ thực tế, và bạn được luyện tập trong môi
                        trường code giống công cụ mà các đội sản phẩm hay dùng.
                      </p>
                      <p>
                        Cuối cùng, cộng đồng và lộ trình rõ ràng giúp bạn biết mình đang ở
                        đâu, cần cải thiện gì, và có thể chứng minh tiến bộ một cách
                        minh bạch.
                      </p>
                    </motion.div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => navigate("/course")}
                      className="bg-brand-600 text-white px-6 md:px-8 py-3 rounded-full font-semibold hover:bg-brand-700 transition duration-200 shadow-sm active:scale-[0.98]"
                    >
                      Bắt đầu ngay
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowExtraIntro((v) => !v)}
                      className="border-2 border-gray-300 text-gray-700 px-6 md:px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition duration-200 active:scale-[0.98]"
                    >
                      {showExtraIntro ? "Thu gọn" : "Tìm hiểu thêm"}
                    </button>
                  </div>
                </div>

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

        <AnimateOnScroll>
          <section className="w-full py-12 md:py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
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

        <section className="w-full py-12 md:py-20 bg-brand-25">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Giá trị cốt lõi
              </h2>
              <div className="w-12 h-1 bg-brand-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {values.map((item, i) => {
                const Icon = item.icon;
                return (
                  <AnimateOnScroll key={i}>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition duration-200 text-center">
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

        <section className="w-full bg-brand-600 text-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {INTRO_STATS.map((s) => (
                <IntroStatTile key={s.label} stat={s} />
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Đội ngũ thành lập web
              </h2>
              <div className="w-12 h-1 bg-brand-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
              {team.map((member, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition duration-200"
                >
                  <div className="h-36 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                    <span className="text-4xl">{member.icon}</span>
                  </div>
                  <div className="p-5 text-center">
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm md:text-base break-words">
                      {member.name}
                    </h4>
                    {member.role ? (
                      <p className="text-sm text-gray-500">{member.role}</p>
                    ) : (
                      <p className="text-xs text-gray-400">Thành viên nhóm</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-16 px-4 md:px-6 bg-brand-25">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-brand-600 to-brand-700 text-white text-center p-8 md:p-12 rounded-3xl shadow-lg">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Bạn đã sẵn sàng để trở thành Master?
            </h2>

            <p className="text-base md:text-lg text-white/90 mb-8">
              Bắt đầu hành trình học ngay hôm nay cùng CodeMaster AI
            </p>

            <button
              type="button"
              onClick={() => navigate("/course")}
              className="bg-white text-brand-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition duration-200 shadow-md active:scale-[0.98]"
            >
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
