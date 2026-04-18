import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiAssistantService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  }

  // 1. TÍNH NĂNG GIA SƯ ẢO
  async explainError(language: string, sourceCode: string, status: string, errorDetail: string | null) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });
      
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

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Lỗi gọi AI:', error);
      return 'Hệ thống AI đang quá tải, bạn hãy tự xem kỹ lại logic code nhé!';
    }
  }

  // 2. TÍNH NĂNG GỢI Ý CHỦ ĐỀ YẾU KÉM
  async recommendTags(failedTags: string[]) {
    if (failedTags.length === 0) return [];
    
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });
      const prompt = `
      Dưới đây là danh sách các thẻ (tags) bài tập mà một học viên liên tục làm sai:
      ${JSON.stringify(failedTags)}
      
      Hãy phân tích và trả về đúng 1 mảng JSON chứa tối đa 3 tags cốt lõi nhất mà học viên này cần ôn tập lại ngay lập tức.
      Chỉ trả về định dạng mảng JSON (ví dụ: ["Array", "Math"]), KHÔNG giải thích gì thêm.
      `;

      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      
      // Xóa các ký tự markdown thừa nếu AI vô tình trả về (như ```json)
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text); // Trả về mảng ['Array', 'Math']
    } catch (error) {
      console.error('Lỗi phân tích AI:', error);
      return [];
    }
  }
}