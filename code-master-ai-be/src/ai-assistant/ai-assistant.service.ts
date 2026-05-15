import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiAssistantService {
  private genAI: GoogleGenerativeAI;
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

  // TÍNH NĂNG GIA SƯ ẢO
  async explainError(language: string, sourceCode: string, status: string, errorDetail: string | null,score: number | null) {
    try {
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

// import { Injectable, Logger } from '@nestjs/common';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// @Injectable()
// export class AiAssistantService {
//   private readonly logger = new Logger(AiAssistantService.name);

//   private readonly apiKeys: string[] = [
//     process.env.GEMINI_API_KEY_1 as string,
//     process.env.GEMINI_API_KEY_2 as string,
//     process.env.GEMINI_API_KEY_3 as string,
//   ].filter(Boolean);

//   private currentKeyIndex = 0;

//   private getClient(): GoogleGenerativeAI {
//     if (this.apiKeys.length === 0) {
//       throw new Error('Không có API key Gemini nào được cấu hình!');
//     }
//     return new GoogleGenerativeAI(this.apiKeys[this.currentKeyIndex]);
//   }

//   private rotateKey(): boolean {
//     const nextIndex = this.currentKeyIndex + 1;
//     if (nextIndex >= this.apiKeys.length) {
//       this.logger.error('Tất cả API keys đã hết quota!');
//       return false;
//     }
//     this.logger.warn(
//       `Key #${this.currentKeyIndex + 1} hết quota → Chuyển sang key #${nextIndex + 1}`,
//     );
//     this.currentKeyIndex = nextIndex;
//     return true;
//   }

//   private async executeWithRetry<T>(
//     operation: (client: GoogleGenerativeAI) => Promise<T>,
//     retries = 3,
//   ): Promise<T> {
//     try {
//       return await operation(this.getClient());
//     } catch (error: any) {
//       // Lỗi 503: Server Gemini đang bận → Retry với key hiện tại
//       if (error?.status === 503 && retries > 0) {
//         this.logger.warn(`Gemini 503 - Đang thử lại... Còn ${retries} lần.`);
//         await new Promise((resolve) => setTimeout(resolve, 2000));
//         return this.executeWithRetry(operation, retries - 1);
//       }

//       // Lỗi 429: Hết quota → Rotate sang key tiếp theo
//       if (error?.status === 429) {
//         this.logger.warn(
//           `Key #${this.currentKeyIndex + 1} trả về lỗi 429 (hết quota).`,
//         );
//         const hasNextKey = this.rotateKey();
//         if (hasNextKey) {
//           return this.executeWithRetry(operation, retries);
//         }
//       }

//       throw error;
//     }
//   }

//   // =========================================================
//   // TÍNH NĂNG 1: GIA SƯ ẢO - Giải thích lỗi code
//   // =========================================================
//   async explainError(
//     language: string,
//     sourceCode: string,
//     status: string,
//     errorDetail: string | null,
//     score: number | null,
//   ): Promise<string> {
//     try {
//       const prompt = `
//         Bạn là một gia sư lập trình AI tận tâm trên hệ thống CodeMaster AI.
//         Học viên vừa nộp bài bằng ngôn ngữ ${language} và bị lỗi: ${status}.
//         Chi tiết lỗi hệ thống báo: ${errorDetail || 'Kết quả đầu ra không khớp với Test case (Sai logic)'}
        
//         Đoạn code của học viên:
//         \`\`\`${language}
//         ${sourceCode}
//         \`\`\`
        
//         QUY TẮC BẮT BUỘC TRẢ LỜI:
//         1. TUYỆT ĐỐI KHÔNG viết code giải sẵn hoặc sửa lại code cho học viên.
//         2. Hãy giải thích ngắn gọn, dễ hiểu (bằng tiếng Việt) tại sao code bị lỗi.
//         3. Đưa ra 1-2 gợi ý logic hoặc câu hỏi gợi mở để học viên tự suy nghĩ cách sửa.
//       `;

//       const result = await this.executeWithRetry((client) => {
//         const model = client.getGenerativeModel({
//           model: 'gemini-2.5-flash-lite',
//         });
//         return model.generateContent(prompt);
//       });

//       return result.response.text();
//     } catch (error) {
//       this.logger.error('Lỗi gọi AI (Gia Sư):', error);
//       return 'Hệ thống AI đang quá tải, bạn hãy tự xem kỹ lại logic code nhé!';
//     }
//   }

//   // =========================================================
//   // TÍNH NĂNG 2: GỢI Ý CHỦ ĐỀ YẾU KÉM
//   // =========================================================
//   async recommendTags(failedTags: string[]): Promise<string[]> {
//     if (failedTags.length === 0) return [];

//     try {
//       const prompt = `
//         Dưới đây là danh sách các thẻ (tags) bài tập mà một học viên liên tục làm sai:
//         ${JSON.stringify(failedTags)}
        
//         Hãy phân tích và trả về đúng 1 mảng JSON chứa tối đa 3 tags cốt lõi nhất mà học viên này cần ôn tập lại ngay lập tức.
//         Chỉ trả về định dạng mảng JSON (ví dụ: ["Array", "Math"]), KHÔNG giải thích gì thêm.
//       `;

//       const result = await this.executeWithRetry((client) => {
//         const model = client.getGenerativeModel({
//           model: 'gemini-2.5-flash-lite',
//         });
//         return model.generateContent(prompt);
//       });

//       let text = result.response.text().trim();
//       text = text.replace(/```json/g, '').replace(/```/g, '').trim();
//       return JSON.parse(text);
//     } catch (error) {
//       this.logger.error('Lỗi phân tích AI (Gợi Ý Tags):', error);
//       return [];
//     }
//   }

//   // =========================================================
//   // TÍNH NĂNG 3: CHAT TƯ VẤN KHÓA HỌC
//   // =========================================================
//   async chatWithConsultant(
//     chatHistory: { role: 'user' | 'model'; text: string }[],
//     newMessage: string,
//     availableCourses: any[],
//   ): Promise<string> {
//     try {
//       const systemInstruction = `
//         Bạn là tư vấn viên đào tạo IT thân thiện tại CodeMaster AI.
//         Luôn xưng là "CodeMaster AI" và gọi khách hàng là "bạn".
//         Dưới đây là danh sách khóa học hệ thống có: ${JSON.stringify(availableCourses)}.
//         TUYỆT ĐỐI KHÔNG tư vấn các khóa học ngoài danh sách này.
//         Dựa vào lịch sử trò chuyện, hãy tư vấn thật ngắn gọn, tự nhiên và chuyên nghiệp.
//       `;

//       const formattedHistory = chatHistory.map((msg) => ({
//         role: msg.role,
//         parts: [{ text: msg.text }],
//       }));

//       const result = await this.executeWithRetry((client) => {
//         const model = client.getGenerativeModel({
//           model: 'gemini-2.5-flash-lite',
//           systemInstruction,
//         });
//         const chat = model.startChat({ history: formattedHistory });
//         return chat.sendMessage(newMessage);
//       });

//       return result.response.text();
//     } catch (error) {
//       this.logger.error('Lỗi khi Chat AI (Tư Vấn):', error);
//       throw new Error('Hệ thống tư vấn đang bận, vui lòng thử lại sau.');
//     }
//   }

//   async generateTestCases(
//   title: string,
//   problemDescription: string,
//   constraints: string,
//   solutionCode: string,
//   numberOfTestCases: number,
// ): Promise<{ input_data: string; expected_output: string; is_hidden: boolean }[]> {
//   const prompt = `
//     Bạn là chuyên gia thuật toán. Hãy tạo ra ${numberOfTestCases} test cases cho bài toán sau.
    
//     THÔNG TIN BÀI TOÁN:
//     - Tên bài: ${title}
//     - Mô tả: ${problemDescription}
//     - Giới hạn: ${constraints}
//     - Code giải chuẩn: \n${solutionCode}

//     YÊU CẦU BẮT BUỘC:
//     1. "input_data" PHẢI LÀ CHUỖI (STRING). Các giá trị cách nhau bởi dấu cách. Ví dụ: "5 10". KHÔNG được dùng object {}.
//     2. "expected_output" PHẢI LÀ CHUỖI (STRING). Chỉ chứa kết quả cuối cùng, KHÔNG kèm văn bản như "Kết quả: ". Ví dụ: "15".
//     3. 2 test cases đầu tiên set "is_hidden": false. Các test cases còn lại set "is_hidden": true.
//     4. CHỈ TRẢ VỀ JSON ARRAY, KHÔNG GIẢI THÍCH.

//     Cấu trúc JSON mẫu:
//     [
//       {
//         "input_data": "5 10",
//         "expected_output": "15",
//         "is_hidden": false
//       }
//     ]
//   `;

//   try {
//     const result = await this.executeWithRetry((client) => {
//       const model = client.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
//       return model.generateContent(prompt);
//     });

//     const rawText = result.response.text();
//     let textResponse = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

//     const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
//     if (jsonMatch) textResponse = jsonMatch[0];

//     const parsedTestCases: any[] = JSON.parse(textResponse);

//     // Chuẩn hóa dữ liệu trả về
//     return parsedTestCases.map((tc, index) => {
//       // Nếu AI lỡ trả về object {"a": 10, "b": 20} → nối thành "10 20"
//       let inputStr = '';
//       if (tc.input_data && typeof tc.input_data === 'object') {
//         inputStr = Object.values(tc.input_data).join(' ');
//       } else {
//         inputStr = String(tc.input_data ?? '').trim();
//       }

//       // Loại bỏ chữ "Kết quả: " nếu AI quên không tuân thủ prompt
//       let outputStr = String(tc.expected_output ?? '').trim();
//       outputStr = outputStr.replace(/Kết quả:\s*/i, '');

//       return {
//         input_data: inputStr,
//         expected_output: outputStr,
//         is_hidden: typeof tc.is_hidden === 'boolean' ? tc.is_hidden : index >= 2,
//       };
//     });
//   } catch (error) {
//     this.logger.error('Lỗi sinh Test Case bằng AI:', error);
//     throw new Error('AI tạo dữ liệu không hợp lệ, vui lòng thử lại.');
//   }
// }
// }