import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiAssistantService {
  private genAI: GoogleGenerativeAI;
  // Sử dụng Logger chuẩn của NestJS để log lỗi đẹp và chuyên nghiệp hơn console.log
  private readonly logger = new Logger(AiAssistantService.name);

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  }

  /**
   * Hàm Helper: Tự động gửi lại request nếu server Google báo lỗi 503
   * @param operation Hàm chứa logic gọi API Gemini
   * @param retries Số lần thử lại tối đa (mặc định 3 lần)
   */
  private async executeWithRetry<T>(operation: () => Promise<T>, retries: number = 3): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      // Nếu gặp lỗi 503 và vẫn còn lượt thử lại
      if (error?.status === 503 && retries > 0) {
        this.logger.warn(`Hệ thống Gemini đang bận (503). Đang thử lại... Còn ${retries} lần.`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Delay 2 giây trước khi thử lại
        return this.executeWithRetry(operation, retries - 1);
      }
      throw error; // Nếu hết lượt hoặc là lỗi khác thì throw ra ngoài
    }
  }

  // 1. TÍNH NĂNG GIA SƯ ẢO
  async explainError(language: string, sourceCode: string, status: string, errorDetail: string | null,score: number | null) {
    try {
      // Đã đổi sang gemini-1.5-flash để đảm bảo tính ổn định cao nhất cho đồ án
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      
      const prompt = `
      Bạn là một gia sư lập trình AI tận tâm trên hệ thống CodeMaster AI.
      Học viên vừa nộp bài bằng ngôn ngữ ${language} và bị lỗi: ${status}.
      Chi tiết lỗi hệ thống báo: ${errorDetail || 'Kết quả đầu ra không khớp với Test case (Sai logic)'}
      
      Đoạn code của học viên:
      \`\`\`${language}
      ${sourceCode}
      \`\`\`
      
      QUY TẮC BẮT BUỘC TRẢ LỜI:
      1. TUYỆT ĐỐI KHÔNG viết code giải sẵn hoặc sửa lại code cho học viên.
      2. Hãy giải thích ngắn gọn, dễ hiểu (bằng tiếng Việt) tại sao code bị lỗi.
      3. Đưa ra 1-2 gợi ý logic hoặc câu hỏi gợi mở để học viên tự suy nghĩ cách sửa.
      `;

      // Bọc lệnh gọi API vào hàm retry
      const result = await this.executeWithRetry(() => model.generateContent(prompt));
      return result.response.text();
    } catch (error) {
      this.logger.error('Lỗi gọi AI (Gia Sư):', error);
      return 'Hệ thống AI đang quá tải, bạn hãy tự xem kỹ lại logic code nhé!';
    }
  }

  // 2. TÍNH NĂNG GỢI Ý CHỦ ĐỀ YẾU KÉM
  async recommendTags(failedTags: string[]) {
    if (failedTags.length === 0) return [];
    
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      const prompt = `
      Dưới đây là danh sách các thẻ (tags) bài tập mà một học viên liên tục làm sai:
      ${JSON.stringify(failedTags)}
      
      Hãy phân tích và trả về đúng 1 mảng JSON chứa tối đa 3 tags cốt lõi nhất mà học viên này cần ôn tập lại ngay lập tức.
      Chỉ trả về định dạng mảng JSON (ví dụ: ["Array", "Math"]), KHÔNG giải thích gì thêm.
      `;

      // Bọc lệnh gọi API vào hàm retry
      const result = await this.executeWithRetry(() => model.generateContent(prompt));
      let text = result.response.text().trim();
      
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text); 
    } catch (error) {
      this.logger.error('Lỗi phân tích AI (Gợi Ý Tags):', error);
      return [];
    }
  }

  // 3. TÍNH NĂNG CHAT TƯ VẤN KHÓA HỌC
  async chatWithConsultant(
    chatHistory: { role: 'user' | 'model'; text: string }[], 
    newMessage: string, 
    availableCourses: any[], 
  ) {
    try {
      // Lưu ý: getGenerativeModel là hàm đồng bộ (sync), không cần dùng await ở đây
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash-lite',
        systemInstruction: `
          Bạn là tư vấn viên đào tạo IT thân thiện tại CodeMaster AI.
          Luôn xưng là "CodeMaster AI" và gọi khách hàng là "bạn".
          Dưới đây là danh sách khóa học hệ thống có: ${JSON.stringify(availableCourses)}.
          TUYỆT ĐỐI KHÔNG tư vấn các khóa học ngoài danh sách này.
          Dựa vào lịch sử trò chuyện, hãy tư vấn thật ngắn gọn, tự nhiên và chuyên nghiệp.
        `
       });

       const formattedHistory = chatHistory.map((msg)=>({
        role: msg.role,
        parts: [{ text: msg.text }]
       }));

       const chat = model.startChat({
        history: formattedHistory
       });

       // Bọc lệnh gửi tin nhắn vào hàm retry
       const result = await this.executeWithRetry(() => chat.sendMessage(newMessage));
       return result.response.text();     
    } catch (error) {
      this.logger.error('Lỗi khi Chat AI (Tư Vấn):', error);
      throw new Error('Hệ thống tư vấn đang bận, vui lòng thử lại sau.');
    }
  }
}