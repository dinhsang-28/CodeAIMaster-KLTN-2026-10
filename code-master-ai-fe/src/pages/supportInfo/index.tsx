import React from "react";
import Footer from "../../components/footer";

type InfoPageType = "privacy" | "help" | "terms" | "faq" | "partners";

type Section = {
  title: string;
  body: string;
};

const pageData: Record<
  InfoPageType,
  {
    title: string;
    subtitle: string;
    sections: Section[];
    highlight: string;
  }
> = {
  privacy: {
    title: "Chính sách bảo mật",
    subtitle:
      "Cách CodeMaster AI thu thập, sử dụng và bảo vệ thông tin cá nhân của học viên.",
    highlight:
      "Chúng tôi chỉ sử dụng dữ liệu để vận hành tài khoản, cải thiện trải nghiệm học tập và hỗ trợ người dùng khi cần.",
    sections: [
      {
        title: "Thông tin được thu thập",
        body: "Hệ thống có thể lưu thông tin tài khoản, lịch sử học tập, đơn hàng, tiến độ bài học và các nội dung bạn gửi khi cần hỗ trợ.",
      },
      {
        title: "Mục đích sử dụng",
        body: "Dữ liệu được dùng để xác thực đăng nhập, cấp quyền truy cập khóa học, theo dõi tiến độ, xử lý thanh toán và cá nhân hóa nội dung học.",
      },
      {
        title: "Bảo vệ dữ liệu",
        body: "CodeMaster AI áp dụng phân quyền truy cập, cơ chế xác thực và các biện pháp kỹ thuật phù hợp để hạn chế truy cập trái phép.",
      },
      {
        title: "Quyền của người dùng",
        body: "Bạn có thể cập nhật thông tin hồ sơ, yêu cầu hỗ trợ về dữ liệu tài khoản hoặc liên hệ với chúng tôi khi cần giải thích thêm.",
      },
    ],
  },
  help: {
    title: "Trung tâm trợ giúp",
    subtitle:
      "Tìm hướng dẫn nhanh cho tài khoản, khóa học, thanh toán và quá trình học tập.",
    highlight:
      "Nếu không tìm thấy câu trả lời, hãy gửi email tới support@codemaster.ai để được hỗ trợ.",
    sections: [
      {
        title: "Tài khoản và đăng nhập",
        body: "Kiểm tra email, mật khẩu và trạng thái tài khoản. Nếu quên mật khẩu hoặc không đăng nhập được, hãy liên hệ bộ phận hỗ trợ.",
      },
      {
        title: "Khóa học của tôi",
        body: "Các khóa đã mua hoặc đã đăng ký miễn phí sẽ nằm trong mục Khóa học của tôi. Tại đây bạn có thể tiếp tục học và xem tiến độ.",
      },
      {
        title: "Thanh toán",
        body: "Sau khi thanh toán thành công, hệ thống sẽ tự động cấp quyền học. Nếu khóa học chưa xuất hiện, hãy kiểm tra lịch sử đơn hàng.",
      },
      {
        title: "Bài tập và chấm điểm",
        body: "Bài quiz và code assignment được mở theo tiến độ bài học. Hãy hoàn thành từng bước để mở nội dung tiếp theo.",
      },
    ],
  },
  terms: {
    title: "Điều khoản dịch vụ",
    subtitle:
      "Các quy định cơ bản khi sử dụng nền tảng học lập trình CodeMaster AI.",
    highlight:
      "Bằng việc sử dụng dịch vụ, bạn đồng ý học tập trung thực, bảo vệ tài khoản cá nhân và tuân thủ quy định của nền tảng.",
    sections: [
      {
        title: "Tài khoản người dùng",
        body: "Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và các hoạt động phát sinh từ tài khoản của mình.",
      },
      {
        title: "Quyền truy cập khóa học",
        body: "Quyền học được cấp theo khóa học đã mua hoặc đã đăng ký. Không chia sẻ tài khoản hoặc phân phối lại nội dung khi chưa được cho phép.",
      },
      {
        title: "Nội dung học tập",
        body: "Tài liệu, video, bài tập và mã nguồn mẫu được cung cấp cho mục đích học tập cá nhân trên nền tảng.",
      },
      {
        title: "Thay đổi dịch vụ",
        body: "CodeMaster AI có thể cập nhật nội dung, tính năng hoặc chính sách để cải thiện chất lượng dịch vụ.",
      },
    ],
  },
  faq: {
    title: "Câu hỏi thường gặp",
    subtitle:
      "Các câu trả lời nhanh cho những thắc mắc phổ biến khi học trên CodeMaster AI.",
    highlight:
      "Phần FAQ được cập nhật theo các vấn đề học viên thường gặp trong quá trình sử dụng nền tảng.",
    sections: [
      {
        title: "Tôi mua khóa học rồi nhưng chưa thấy trong My Courses?",
        body: "Hãy kiểm tra trạng thái thanh toán trong lịch sử đơn hàng. Nếu đơn hàng đã thành công nhưng chưa có khóa học, hãy liên hệ hỗ trợ.",
      },
      {
        title: "Khóa học miễn phí bắt đầu như thế nào?",
        body: "Vào trang chi tiết khóa học và bấm đăng ký học miễn phí. Sau đó khóa học sẽ xuất hiện trong mục Khóa học của tôi.",
      },
      {
        title: "Tại sao bài tiếp theo bị khóa?",
        body: "Một số bài học yêu cầu hoàn thành video, quiz hoặc assignment trước khi mở nội dung tiếp theo.",
      },
      {
        title: "Tôi có thể học lại bài đã hoàn thành không?",
        body: "Có. Bạn có thể vào Khóa học của tôi và mở lại các bài đã học bất kỳ lúc nào.",
      },
    ],
  },
  partners: {
    title: "Liên hệ hợp tác",
    subtitle:
      "Kết nối với CodeMaster AI cho các chương trình đào tạo, tuyển dụng và hợp tác nội dung.",
    highlight:
      "Chúng tôi chào đón các đối tác giáo dục, doanh nghiệp công nghệ và cộng đồng lập trình cùng xây dựng hệ sinh thái học tập thực chiến.",
    sections: [
      {
        title: "Đào tạo doanh nghiệp",
        body: "Thiết kế chương trình đào tạo lập trình, AI và kỹ năng công nghệ theo nhu cầu của đội ngũ kỹ thuật.",
      },
      {
        title: "Hợp tác nội dung",
        body: "Cùng xây dựng khóa học, bài tập thực hành, case study hoặc chương trình mentoring cho học viên.",
      },
      {
        title: "Tuyển dụng học viên",
        body: "Kết nối doanh nghiệp với học viên có kỹ năng phù hợp thông qua các chương trình thực hành và đánh giá năng lực.",
      },
      {
        title: "Thông tin liên hệ",
        body: "Gửi đề xuất hợp tác tới support@codemaster.ai hoặc gọi 0865018731 để đội ngũ CodeMaster AI phản hồi.",
      },
    ],
  },
};

export default function SupportInfoPage({ type }: { type: InfoPageType }) {
  const data = pageData[type];

  return (
    <>
      <main className="min-h-screen bg-brand-25 text-slate-900">
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-600">
              CodeMaster AI
            </p>
            <h1 className="text-3xl font-black tracking-tight text-brand-800 sm:text-5xl">
              {data.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              {data.subtitle}
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-base font-semibold leading-7 text-brand-800">
              {data.highlight}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {data.sections.map((section) => (
              <article
                key={section.title}
                className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm"
              >
                <h2 className="text-lg font-bold text-brand-800">
                  {section.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
