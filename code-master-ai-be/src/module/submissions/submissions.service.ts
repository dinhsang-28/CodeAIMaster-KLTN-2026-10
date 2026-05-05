import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Submission } from './entities/submission.entity';
import { Model, Types } from 'mongoose';
import { TestCase } from '../testcases/entities/testcase.entity';
import { CodeAssignment } from '../code-assignments/entities/code-assignment.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AiAssistantService } from '@/ai-assistant/ai-assistant.service';
import { JUDGE0_LANGUAGES } from '@/common/constants/languages.constant';
import { UserLessonProgressService } from '../user-lesson-progress/user-lesson-progress.service';
import { Course } from '../courses/entities/course.entity';
import { Advisory } from './entities/advisory.entity';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { Question } from '../questions/entities/question.entity';

@Injectable()
export class SubmissionsService {
  private readonly JUDGE0_URL = 'https://ce.judge0.com';
  // courseModel: any;

  constructor(
    @InjectModel(Submission.name) private readonly submissionModel: Model<Submission>,
    @InjectModel(TestCase.name) private readonly testCaseModel: Model<TestCase>,
    @InjectModel(CodeAssignment.name) private readonly codeAssignmentModel: Model<CodeAssignment>,
    @InjectModel('Course') private readonly courseModel: Model<Course>,
    @InjectModel('Advisory') private readonly advisoryModel: Model<Advisory>,
    @InjectModel(Quiz.name) private readonly quizModel: Model<Quiz>,
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
    private readonly aiAssistantService: AiAssistantService,
    private readonly httpService: HttpService,
    private readonly userLessonProgressService: UserLessonProgressService,
  ) {}

//  async submitCode(
//     userId: string,
//     assignmentId: string,
//     codeAssignmentId: string,
//     language: string,
//     sourceCode: string,
//   ) {
//     try {
//       const assignmentObjectId = Types.ObjectId.isValid(assignmentId)
//         ? new Types.ObjectId(assignmentId)
//         : null;

//       const codeAssignmentObjectId = Types.ObjectId.isValid(codeAssignmentId)
//         ? new Types.ObjectId(codeAssignmentId)
//         : null;

//       let codeAssignment: any = null;

//       if (codeAssignmentObjectId) {
//         codeAssignment = await this.codeAssignmentModel.findById(codeAssignmentObjectId).lean().exec();
//       }

//       if (!codeAssignment && assignmentObjectId) {
//         codeAssignment = await this.codeAssignmentModel.findOne({ assignment_id: assignmentObjectId }).lean().exec();
//       }

//       if (!codeAssignment) {
//         throw new BadRequestException('Không tìm thấy codeAssignment hợp lệ cho bài tập này.');
//       }

//       const resolvedCodeAssignmentObjectId = new Types.ObjectId(codeAssignment._id as any);

//       const testCases = await this.testCaseModel
//         .find({ code_assignment_id: resolvedCodeAssignmentObjectId })
//         .lean()
//         .exec();

//       if (!testCases || testCases.length === 0) {
//         throw new BadRequestException('Bài tập chưa có testcase. Vui lòng tạo testcase bằng AI trước khi cho học viên nộp bài.');
//       }

//       //  Map ID ngôn ngữ
//       // const languageMap = { python: 71, cpp: 54, java: 62, javascript: 63 };
//       const normalizedLang = language.toLowerCase().trim();
//       const languageId = JUDGE0_LANGUAGES[normalizedLang];
//       if (!languageId) {
//         throw new BadRequestException(`Hệ thống chưa hỗ trợ ngôn ngữ: ${language}`);
//       }

//       let passedCases = 0;
//       let maxTime = 0;
//       let maxMemory = 0;
//       let finalStatus = 'ACCEPTED';
//       let errorDetail:string | null = null;
      

//       // HÀM DELAY ĐỂ HỖ TRỢ POLLING (Nghỉ một chút trước khi hỏi lại Judge0)
//       const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

//       // Gửi lên Judge0 
//       const judgePromises = testCases.map(async (testCase: any) => {
//         const payload = {
//           source_code: Buffer.from(sourceCode).toString('base64'),
//           language_id: languageId,
//           stdin: testCase.input_data ? Buffer.from(testCase.input_data).toString('base64') : null, 
//           expected_output: testCase.expected_output ? Buffer.from(testCase.expected_output).toString('base64') : null,
//           cpu_time_limit: codeAssignment.time_limit || 2.0,
//           memory_limit: codeAssignment.memory_limit || 128000,
//         };

//         //  Gửi request lấy Token 
//         const initResponse = await firstValueFrom(
//           this.httpService.post(
//             `${this.JUDGE0_URL}/submissions?base64_encoded=true&wait=false`,
//             payload,
//             { headers: { 'Content-Type': 'application/json' } },
//           ),
//         );
        
//         const token = initResponse.data.token;
//         let result: any = null;
//         let statusId = 1; // 1: In Queue, 2: Processing

//         //  Polling - Vòng lặp hỏi kết quả liên tục
//         while (statusId === 1 || statusId === 2) {
//           await delay(1000); // Nghỉ 1 giây để Judge0 kịp chayvà chấm bài
//           // lay ket qua khi judge0 chấm xong
//           const checkResponse = await firstValueFrom(
//             this.httpService.get(
//               `${this.JUDGE0_URL}/submissions/${token}?base64_encoded=true`
//             )
//           );
          
//           result = checkResponse.data;
//           statusId = result.status.id;
//         }

//         //  Có kết quả cuối cùng thì trả về
//         return result;
//       });
      

//       const judgeResults = await Promise.all(judgePromises);
      
//       console.log("=== KẾT QUẢ TỪ JUDGE0 ===");
//       console.log(JSON.stringify(judgeResults, null, 2));
//       console.log("=========================");

//       //  Phân tích kết quả
//       for (const result of judgeResults) {
//         if (result.status.id === 3) {
//           passedCases++;
//         } else {
//           if (result.status.id === 6) {
//             finalStatus = 'COMPILATION_ERROR';
//             errorDetail = result.compile_output 
//               ? Buffer.from(result.compile_output, 'base64').toString('utf-8') 
//               : 'Lỗi biên dịch không xác định';
//             break;
//           } else {
//             if (finalStatus === 'ACCEPTED') {
//               finalStatus = result.status.description.toUpperCase().replace(/ /g, '_');
//             }
//             if (!errorDetail && result.stderr) {
//               errorDetail = Buffer.from(result.stderr, 'base64').toString('utf-8');
//             }
//           }
//         }
//         if (result.time && parseFloat(result.time) > maxTime) maxTime = parseFloat(result.time);
//         if (result.memory && result.memory > maxMemory) maxMemory = result.memory;
//       }

//       // Lưu Submission 
//       const newSubmission = await this.submissionModel.create({
//         user_id: userId,
//         codeAssignment_id: resolvedCodeAssignmentObjectId,
//         language: language,
//         code: sourceCode,
//         status: finalStatus,
//         score: (passedCases / testCases.length) * 10,
//         ai_hint: null
//       });

//       // Update UserLessonProgress
//       if (codeAssignment.assignment_id) {
//         await this.userLessonProgressService.handleAssignmentGraded(
//           userId,
//           codeAssignment.assignment_id.toString(),
//           finalStatus === 'ACCEPTED',
//         );
//       }

//       return {
//         message: 'Chấm bài hoàn tất',
//         submission: newSubmission,
//         passedCases,
//         totalCases: testCases.length,
//         compileError: errorDetail,
//       };

//     } catch (error: any) {
//       if (error instanceof BadRequestException) throw error;
      
//       // Log chi tiết lỗi để debug
//       console.error('=== LỖI HỆ THỐNG CHẤM BÀI ===');
//       console.error('Error message:', error?.message);
//       console.error('Error response status:', error?.response?.status);
//       console.error('Error response data:', JSON.stringify(error?.response?.data, null, 2));
//       console.error('Full error:', error);
//       console.error('================================');

//       // Trả lỗi chi tiết hơn
//       const detail = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Lỗi không xác định';
//       throw new InternalServerErrorException(`Lỗi hệ thống chấm bài: ${detail}`);
//     }
//   }

//   async submitCode(
//     userId: string,
//     assignmentId: string,
//     codeAssignmentId: string,
//     language: string,
//     sourceCode: string,
//   ) {
//     try {
//       // 1. CHUẨN BỊ DỮ LIỆU & KIỂM TRA ĐẦU VÀO
//       const assignmentObjectId = Types.ObjectId.isValid(assignmentId)
//         ? new Types.ObjectId(assignmentId)
//         : null;

//       const codeAssignmentObjectId = Types.ObjectId.isValid(codeAssignmentId)
//         ? new Types.ObjectId(codeAssignmentId)
//         : null;

//       let codeAssignment: any = null;

//       if (codeAssignmentObjectId) {
//         codeAssignment = await this.codeAssignmentModel.findById(codeAssignmentObjectId).lean().exec();
//       }

//       if (!codeAssignment && assignmentObjectId) {
//         codeAssignment = await this.codeAssignmentModel.findOne({ assignment_id: assignmentObjectId }).lean().exec();
//       }

//       if (!codeAssignment) {
//         throw new BadRequestException('Không tìm thấy codeAssignment hợp lệ cho bài tập này.');
//       }

//       const resolvedCodeAssignmentObjectId = new Types.ObjectId(codeAssignment._id as any);

//       const testCases = await this.testCaseModel
//         .find({ code_assignment_id: resolvedCodeAssignmentObjectId })
//         .lean()
//         .exec();

//       if (!testCases || testCases.length === 0) {
//         throw new BadRequestException('Bài tập chưa có testcase. Vui lòng tạo testcase bằng AI trước khi cho học viên nộp bài.');
//       }

//       // Map ID ngôn ngữ
//       const normalizedLang = language.toLowerCase().trim();
//       const languageId = JUDGE0_LANGUAGES[normalizedLang];
//       if (!languageId) {
//         throw new BadRequestException(`Hệ thống chưa hỗ trợ ngôn ngữ: ${language}`);
//       }

//       // =====================================================================
//       // 🚨 BƯỚC QUAN TRỌNG: TIÊM CODE NGẦM (CODE INJECTION) CHO JAVASCRIPT
//       // =====================================================================
//       let finalSourceCode = sourceCode;

//       if (normalizedLang === 'javascript' || normalizedLang === 'js') {
//         finalSourceCode = `${sourceCode}

// // --- ĐOẠN CODE HỆ THỐNG TỰ ĐỘNG THÊM VÀO ĐỂ ĐỌC/GHI LUỒNG I/O CHO JUDGE0 ---
// const fs = require('fs');
// try {
//   const inputData = fs.readFileSync(0, 'utf-8');
//   if (typeof solve === 'function') {
//     const result = solve(inputData);
//     if (result !== undefined) {
//       console.log(result);
//     }
//   }
// } catch (e) {
//   console.error(e);
// }
// `;
//       }

//       // 2. BIẾN THEO DÕI KẾT QUẢ
//       let passedCases = 0;
//       let maxTime = 0;
//       let maxMemory = 0;
//       let finalStatus = 'ACCEPTED';
//       let errorDetail: string | null = null;
//       const judgeResults: any[] = [];

//       // HÀM DELAY ĐỂ HỖ TRỢ POLLING
//       const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

//       // =====================================================================
//       // 3. GỬI LÊN JUDGE0 (CHẠY TUẦN TỰ ĐỂ TRÁNH LỖI 429 - RATE LIMIT)
//       // =====================================================================
//       for (const testCase of testCases) {
//         const payload = {
//           // Gửi đoạn code đã được "tiêm" thêm hàm đọc I/O
//           source_code: Buffer.from(finalSourceCode).toString('base64'),
//           language_id: languageId,
//           stdin: testCase.input_data ? Buffer.from(testCase.input_data).toString('base64') : null, 
//           expected_output: testCase.expected_output ? Buffer.from(testCase.expected_output).toString('base64') : null,
//           cpu_time_limit: codeAssignment.time_limit || 2.0,
//           memory_limit: codeAssignment.memory_limit || 128000,
//         };

//         // Gửi request lấy Token 
//         const initResponse = await firstValueFrom(
//           this.httpService.post(
//             `${this.JUDGE0_URL}/submissions?base64_encoded=true&wait=false`,
//             payload,
//             { headers: { 'Content-Type': 'application/json' } },
//           ),
//         );
        
//         const token = initResponse.data.token;
//         let result: any = null;
//         let statusId = 1; // 1: In Queue, 2: Processing

//         // Polling - Vòng lặp hỏi kết quả liên tục
//         while (statusId === 1 || statusId === 2) {
//           await delay(1000); // Nghỉ 1 giây
//           const checkResponse = await firstValueFrom(
//             this.httpService.get(
//               `${this.JUDGE0_URL}/submissions/${token}?base64_encoded=true`
//             )
//           );
          
//           result = checkResponse.data;
//           statusId = result.status.id;
//         }

//         judgeResults.push(result);

//         // 4. PHÂN TÍCH KẾT QUẢ
//         // Dừng chấm các Test Case khác nếu dính lỗi biên dịch
//         if (statusId === 6) {
//           finalStatus = 'COMPILATION_ERROR';
//           errorDetail = result.compile_output 
//             ? Buffer.from(result.compile_output, 'base64').toString('utf-8') 
//             : 'Lỗi biên dịch không xác định';
//           break; 
//         } 
        
//         if (statusId === 3) {
//           passedCases++;
//         } else {
//           if (finalStatus === 'ACCEPTED') {
//             finalStatus = result.status.description.toUpperCase().replace(/ /g, '_');
//           }
//           if (!errorDetail && result.stderr) {
//             errorDetail = Buffer.from(result.stderr, 'base64').toString('utf-8');
//           }
//         }

//         if (result.time && parseFloat(result.time) > maxTime) maxTime = parseFloat(result.time);
//         if (result.memory && result.memory > maxMemory) maxMemory = result.memory;
//       }

//       console.log("=== KẾT QUẢ TỪ JUDGE0 ===");
//       console.log(JSON.stringify(judgeResults, null, 2));
//       console.log("=========================");

//       // 5. LƯU KẾT QUẢ VÀO DATABASE
//       const newSubmission = await this.submissionModel.create({
//         user_id: userId,
//         codeAssignment_id: resolvedCodeAssignmentObjectId,
//         language: language,
//         code: sourceCode, // Lưu code GỐC của học viên (Không lưu phần code đã tiêm để giữ code sạch)
//         status: finalStatus,
//         score: (passedCases / testCases.length) * 10,
//         execute_time: maxTime,     
//         execute_memory: maxMemory, 
//         ai_hint: null
//       });

//       // Update UserLessonProgress
//       if (codeAssignment.assignment_id) {
//         await this.userLessonProgressService.handleAssignmentGraded(
//           userId,
//           codeAssignment.assignment_id.toString(),
//           finalStatus === 'ACCEPTED',
//         );
//       }

//       return {
//         message: 'Chấm bài hoàn tất',
//         submission: newSubmission,
//         passedCases,
//         totalCases: testCases.length,
//         compileError: errorDetail,
//       };

//     } catch (error: any) {
//       if (error instanceof BadRequestException) throw error;
      
//       console.error('=== LỖI HỆ THỐNG CHẤM BÀI ===');
//       console.error('Error message:', error?.message);
//       console.error('Error response status:', error?.response?.status);
//       console.error('Error response data:', JSON.stringify(error?.response?.data, null, 2));
//       console.error('Full error:', error);
//       console.error('================================');

//       const detail = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Lỗi không xác định';
//       throw new InternalServerErrorException(`Lỗi hệ thống chấm bài: ${detail}`);
//     }
//   }

async submitCode(
    userId: string,
    assignmentId: string,
    codeAssignmentId: string,
    language: string,
    sourceCode: string,
  ) {
    try {
      // 1. CHUẨN BỊ DỮ LIỆU & KIỂM TRA ĐẦU VÀO
      const assignmentObjectId = Types.ObjectId.isValid(assignmentId)
        ? new Types.ObjectId(assignmentId)
        : null;

      const codeAssignmentObjectId = Types.ObjectId.isValid(codeAssignmentId)
        ? new Types.ObjectId(codeAssignmentId)
        : null;

      let codeAssignment: any = null;

      if (codeAssignmentObjectId) {
        codeAssignment = await this.codeAssignmentModel.findById(codeAssignmentObjectId).lean().exec();
      }

      if (!codeAssignment && assignmentObjectId) {
        codeAssignment = await this.codeAssignmentModel.findOne({ assignment_id: assignmentObjectId }).lean().exec();
      }

      if (!codeAssignment) {
        throw new BadRequestException('Không tìm thấy cấu hình chấm code cho bài tập này.');
      }

      const resolvedCodeAssignmentObjectId = new Types.ObjectId(codeAssignment._id as any);

      const testCases = await this.testCaseModel
        .find({ code_assignment_id: resolvedCodeAssignmentObjectId })
        .lean()
        .exec();

      if (!testCases || testCases.length === 0) {
        throw new BadRequestException('Bài tập chưa có testcase. Vui lòng tạo testcase bằng AI trước khi nộp.');
      }

      // Map ID ngôn ngữ
      const normalizedLang = language.toLowerCase().trim();
      const languageId = JUDGE0_LANGUAGES[normalizedLang];
      if (!languageId) {
        throw new BadRequestException(`Hệ thống chưa hỗ trợ ngôn ngữ: ${language}`);
      }

      // =====================================================================
      // 🚨 SMART CODE INJECTION: XỬ LÝ LINH HOẠT MỌI CÁCH VIẾT CỦA HỌC VIÊN
      // =====================================================================
      let finalSourceCode = sourceCode;

      // Xử lý thông minh cho JAVASCRIPT
      if (normalizedLang === 'javascript' || normalizedLang === 'js') {
        // Kiểm tra xem học viên có tự in kết quả ra chưa (Tự viết full code)
        const isFullScript = sourceCode.includes('console.log') || sourceCode.includes('fs.readFileSync');

        if (!isFullScript) {
          finalSourceCode = `${sourceCode}

// --- SMART WRAPPER: HỆ THỐNG TỰ CHÈN ĐỂ CHẤM BÀI ---
const __fs = require('fs');
try {
  const __inputData = __fs.readFileSync(0, 'utf-8');
  
  // Tự động săn lùng các tên hàm phổ biến mà học viên hay dùng
  const __targetFunc = typeof solve === 'function' ? solve 
                     : typeof main === 'function' ? main 
                     : typeof execute === 'function' ? execute
                     : null;

  if (__targetFunc) {
    const __result = __targetFunc(__inputData);
    
    // In kết quả tự động (Hỗ trợ cả Mảng và Object)
    if (__result !== undefined && __result !== null) {
      if (typeof __result === 'object') {
        console.log(JSON.stringify(__result)); 
      } else {
        console.log(__result);
      }
    }
  }
} catch (e) {
  // Nuốt lỗi để không làm bẩn màn hình Console của học viên
}
`;
        }
      } 
      // Xử lý thông minh cho PYTHON (Tặng thêm)
      else if (normalizedLang === 'python' || normalizedLang === 'py') {
        const isFullScript = sourceCode.includes('print(') || sourceCode.includes('sys.stdin');
        
        if (!isFullScript) {
          finalSourceCode = `${sourceCode}

# --- SMART WRAPPER: HỆ THỐNG TỰ CHÈN ĐỂ CHẤM BÀI ---
import sys, json
try:
    __inputData = sys.stdin.read()
    __func = locals().get('solve', locals().get('main'))
    
    if callable(__func):
        __result = __func(__inputData)
        if __result is not None:
            if isinstance(__result, (dict, list)):
                print(json.dumps(__result).replace(" ", ""))
            else:
                print(__result)
except Exception:
    pass
`;
        }
      }

      // =====================================================================
      // 2. BIẾN THEO DÕI KẾT QUẢ VÀ GỬI LÊN JUDGE0
      // =====================================================================
      let passedCases = 0;
      let maxTime = 0;
      let maxMemory = 0;
      let finalStatus = 'ACCEPTED';
      let errorDetail: string | null = null;
      const judgeResults: any[] = [];

      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      // Gửi lên Judge0 (Chạy Tuần tự an toàn)
      for (const testCase of testCases) {
        const payload = {
          source_code: Buffer.from(finalSourceCode).toString('base64'), // Chú ý: Gửi code đã tiêm
          language_id: languageId,
          stdin: testCase.input_data ? Buffer.from(testCase.input_data).toString('base64') : null, 
          expected_output: testCase.expected_output ? Buffer.from(testCase.expected_output).toString('base64') : null,
          cpu_time_limit: codeAssignment.time_limit || 2.0,
          memory_limit: codeAssignment.memory_limit || 128000,
        };

        const initResponse = await firstValueFrom(
          this.httpService.post(
            `${this.JUDGE0_URL}/submissions?base64_encoded=true&wait=false`,
            payload,
            { headers: { 'Content-Type': 'application/json' } },
          ),
        );
        
        const token = initResponse.data.token;
        let result: any = null;
        let statusId = 1;

        while (statusId === 1 || statusId === 2) {
          await delay(1000); 
          const checkResponse = await firstValueFrom(
            this.httpService.get(
              `${this.JUDGE0_URL}/submissions/${token}?base64_encoded=true`
            )
          );
          result = checkResponse.data;
          statusId = result.status.id;
        }

        judgeResults.push(result);

        // 3. PHÂN TÍCH LỖI VÀ KẾT QUẢ
        if (statusId === 6) {
          finalStatus = 'COMPILATION_ERROR';
          errorDetail = result.compile_output 
            ? Buffer.from(result.compile_output, 'base64').toString('utf-8') 
            : 'Lỗi biên dịch không xác định';
          break; 
        } 
        
        if (statusId === 3) {
          passedCases++;
        } else {
          if (finalStatus === 'ACCEPTED') {
            finalStatus = result.status.description.toUpperCase().replace(/ /g, '_');
          }
          if (!errorDetail && result.stderr) {
            errorDetail = Buffer.from(result.stderr, 'base64').toString('utf-8');
          }
        }

        if (result.time && parseFloat(result.time) > maxTime) maxTime = parseFloat(result.time);
        if (result.memory && result.memory > maxMemory) maxMemory = result.memory;
      }

      // 4. LƯU VÀO DATABASE (Lưu code gốc của học viên)
      const newSubmission = await this.submissionModel.create({
        user_id: userId,
        codeAssignment_id: resolvedCodeAssignmentObjectId,
        language: language,
        code: sourceCode, // Lưu sourceCode GỐC, Không lưu finalSourceCode để giấu bí mật
        status: finalStatus,
        score: (passedCases / testCases.length) * 10,
        execute_time: maxTime,     
        execute_memory: maxMemory, 
        ai_hint: null
      });

      // Update UserLessonProgress
      if (codeAssignment.assignment_id) {
        await this.userLessonProgressService.handleAssignmentGraded(
          userId,
          codeAssignment.assignment_id.toString(),
          finalStatus === 'ACCEPTED',
        );
      }

      return {
        message: 'Chấm bài hoàn tất',
        submission: newSubmission,
        passedCases,
        totalCases: testCases.length,
        compileError: errorDetail,
      };

    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      console.error('=== LỖI HỆ THỐNG CHẤM BÀI ===', error);
      const detail = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Lỗi không xác định';
      throw new InternalServerErrorException(`Lỗi hệ thống chấm bài: ${detail}`);
    }
  }

  async submitQuiz(userId: string, submitQuizDto: SubmitQuizDto) {
    const { quiz_id, answers } = submitQuizDto;

    const quiz = await this.quizModel.findById(quiz_id).lean().exec();
    if (!quiz) {
      throw new BadRequestException('Không tìm thấy Quiz.');
    }

    const questions = await this.questionModel.find({ quiz_id }).lean().exec();
    if (!questions || questions.length === 0) {
      throw new BadRequestException('Quiz không có câu hỏi nào.');
    }

    let correctCount = 0;
    const results: any[] = [];

    const normalizeLetter = (value?: string) => {
      const normalized = (value || '').trim().toUpperCase();
      return ['A', 'B', 'C', 'D'].indexOf(normalized);
    };

    for (const question of questions) {
      const userAnswer = answers.find(a => a.question_id === question._id.toString());
      const correctIndex = normalizeLetter(question.correct_answer);
      const isCorrect = userAnswer && userAnswer.selected_answer && userAnswer.selected_answer.length > 0 && 
                        userAnswer.selected_answer.length === 1 && 
                        parseInt(userAnswer.selected_answer[0]) === correctIndex;
      
      if (isCorrect) {
        correctCount++;
      }
      
      results.push({
        question_id: question._id,
        isCorrect: Boolean(isCorrect),
      });
    }

    const totalQuestions = questions.length;
    const passed = correctCount === totalQuestions; // Require 100% to pass? Or 80%? Let's use 100% for now or calculate score
    const score = (correctCount / totalQuestions) * 10;

    // Update lesson progress
    if (quiz.assignment_id) {
      await this.userLessonProgressService.handleAssignmentGraded(
        userId,
        quiz.assignment_id.toString(),
        passed,
      );
    }

    return {
      message: 'Chấm bài hoàn tất',
      quizId: quiz_id,
      score,
      passed,
      correctCount,
      totalQuestions,
      results
    };
  }

    // gia su tra loi khi nguoi dung muon hieu sai gi
  async requestAiTutor(submissionId:string){
    const submission = await this.submissionModel.findById(submissionId);
    if(!submission){
      throw new BadRequestException('khong tim thay lich su bai nop')
    }
    if(submission.status === 'ACCEPTED' &&submission.score === 10){
      return { message: 'Bài của bạn đã hoàn hảo, không cần gia sư nữa nhé!' };
    }
    if(submission.ai_hint){
      return {ai_hint:submission.ai_hint,message:'da tra loi cho nguoi dung'};
    }
    try {
      const aiHint = await this.aiAssistantService.explainError(
        submission.language,
        submission.code,
        submission.status,
        null,
        submission.score
      )
      // luu cau tra loi vao data
      submission.ai_hint=aiHint;
      await submission.save();
      return { ai_hint: aiHint,message:"luu cau tra loi thanh cong" };
      
    } catch (error) {
      console.error('Lỗi khi gọi Gia sư AI:', error);
      throw new InternalServerErrorException('Gia sư AI đang bận, vui lòng thử lại sau.');
    }
  }

  // HÀM LẤY BÀI TẬP ĐỀ XUẤT CHO USER
  // async getRecommendationsForUser(userId: string) {
  //   //  Tìm các bài user đã nộp nhưng bị sai (WRONG_ANSWER, COMPILATION_ERROR)
  //   const failedSubmissions = await this.submissionModel
  //     .find({ user_id: userId, status: { $ne: 'ACCEPTED' } })
  //     .populate('assignment_id') // Join bảng để lấy thông tin bài tập
  //     .exec();

  //   // Gom tất cả các Tags mà user hay làm sai lại
  //   let weakTags: string[] = [];
  //   failedSubmissions.forEach(sub => {
  //     const assignment = sub.assignment_id as any;
  //     if (assignment && assignment.tags) {
  //       weakTags.push(...assignment.tags);
  //     }
  //   });

  //   // Nếu user chưa sai bài nào, trả về các bài dễ mặc định
  //   if (weakTags.length === 0) {
  //     const easyAssignments = await this.codeAssignmentModel.find({ difficulty: 'EASY' }).limit(5).exec();
  //     return {weakFocus: [], assignments: easyAssignments};
  //   }
  //    try {
  //     // lay toan bo bai tap trong dv de gui sang python phan tich
  //     const allAssignmentsRaw = await this.codeAssignmentModel.find().select('_id tags difficulty').lean().exec();
  //     // dinh dang lai data cho khop format ma python cho
  //     const allAssignments = allAssignmentsRaw.map(a=>({
  //       id:a._id.toString(),
  //       tags: a.tags || [],
  //       difficulty: a.difficulty || 'EASY'
  //     }))
  //     //GỌI SANG MICROSERVICE PYTHON BẰNG HTTP POST
  //     const pythonResponse = await firstValueFrom(
  //       this.httpService.post('http://localhost:8000/recommend', {
  //         weak_tags: weakTags,
  //         all_assignments: allAssignments
  //       })
  //     );

  //     const recommendedIds = pythonResponse.data.recommended_ids;

  //     // Nếu Python không tìm được bài nào phù hợp (hoặc báo lỗi logic)
  //     if(!recommendedIds || recommendedIds.length === 0){
  //       const backupAssignments = await this.codeAssignmentModel.find({ difficulty: 'EASY' }).limit(5).exec();
  //       return { weakFocus: weakTags, assignments: backupAssignments };
  //     }
  //     //. Query lại Database MongoDB để lấy thông tin chi tiết (tên bài, đề bài...) của các ID được gợi ý
  //     const finalRecommendations = await this.codeAssignmentModel
  //       .find({ _id: { $in: recommendedIds } })
  //       .exec();
  //       return {
  //         weakFocus: weakTags, // Báo cho frontend biết user đang yếu tag nào
  //       assignments: finalRecommendations // Trả danh sách bài tập ra
  //       }
      
  //    } catch (e) {
  //     console.error('Lỗi khi gọi Microservice Python AI:',);
  //     // Fallback: Nếu sập server Python hoặc lỗi mạng, hệ thống không được chết mà tự động trả về bài dễ
  //     const fallbackAssignments = await this.codeAssignmentModel.find({ difficulty: 'EASY' }).limit(5).exec();
  //     return { weakFocus: weakTags, assignments: fallbackAssignments };
      
  //    }

  //   // // 3. Nhờ AI phân tích xem yếu phần nào nhất
  //   // const recommendedTags = await this.aiAssistantService.recommendTags(weakTags);

  //   // // 4. Tìm trong Database các bài tập có Tag trùng với AI gợi ý
  //   // // Lấy ưu tiên các bài dễ (EASY) hoặc trung bình (MEDIUM)
  //   // const recommendedAssignments = await this.codeAssignmentModel
  //   //   .find({ 
  //   //     tags: { $in: recommendedTags }, // Tìm bài có chứa tag AI đề xuất
  //   //     difficulty: { $in: ['EASY', 'MEDIUM'] }
  //   //   })
  //   //   .limit(5)
  //   //   .exec();

  //   // return {
  //   //   weakFocus: recommendedTags, // Ví dụ: ['Array', 'For Loop']
  //   //   assignments: recommendedAssignments // Danh sách 5 bài tập trả về cho Frontend
  //   // };
  // }
  async chatWithConsultant(
    chatHistory: { role: 'user' | 'model'; text: string }[],
    newMessage: string,
    currentUser?: any
  ) {
    const courses = await this.courseModel.find({ status: 'active' })
      .select('_id title level price')
      .lean();
    let systemInstruction = `
      Bạn là AI Tư Vấn của CodeMaster. Khách hàng đang chat với bạn.
      Danh sách khóa học: ${JSON.stringify(courses)}.
    `;

    // 2. PHÂN NHÁNH LỆNH MẬT THEO TRẠNG THÁI ĐĂNG NHẬP
    if (currentUser && currentUser.email) {
      // TRƯỜNG HỢP 1: KHÁCH ĐÃ ĐĂNG NHẬP
      systemInstruction += `
         LỆNH TỐI CAO: 
        Khách hàng này ĐÃ ĐĂNG NHẬP (Email của họ là: ${currentUser.email}).
        Nếu khách hàng có ý định đăng ký khóa học, muốn mua, hoặc nhờ tư vấn: 
        1. TUYỆT ĐỐI KHÔNG ĐƯỢC HỎI xin thông tin liên hệ của họ nữa.
        2. Hãy tự động chèn đoạn mã này vào CUỐI câu trả lời của bạn: [LEAD: ${currentUser.email}]
        3. Tuyệt đối không để lộ mã [LEAD] này trong câu văn.
      `;
    } else {
      // TRƯỜNG HỢP 2: KHÁCH VÃNG LAI (CHƯA ĐĂNG NHẬP)
      systemInstruction += `
         LỆNH TỐI CAO VỀ THU THẬP THÔNG TIN: 
        1. Nếu khách hàng muốn đặt khóa học nhưng chưa cho thông tin: Hãy hỏi xin Số điện thoại hoặc Email một cách lịch sự. TUYỆT ĐỐI KHÔNG SỬ DỤNG thẻ [LEAD].
        2. CHỈ KHI NÀO khách hàng ĐÃ THỰC SỰ gõ ra Số điện thoại hoặc Email cụ thể, bạn mới được phép chèn đoạn mã này vào CUỐI câu: [LEAD: số_hoặc_email_của_khách]
        3. Tuyệt đối không bao giờ được trả về đoạn mã mẫu chứa dấu ngoặc nhọn.
      `;
    }
    // Gọi AI (Gộp lệnh mật vào câu hỏi cuối cùng để ép AI tuân thủ)
    let aiResponse = await this.aiAssistantService.chatWithConsultant(
      chatHistory, 
      newMessage + `\n\n(Hệ thống nhắc nhở AI: ${systemInstruction})`, 
      courses
    );

    // 2. Dùng Regex để tìm mã ẩn [LEAD: ...]
    const leadRegex = /\[LEAD:\s*(.+?)\]/;
    const match = aiResponse.match(leadRegex);

    if (match) {
      //  BƯỚC QUAN TRỌNG: Chuẩn hóa dữ liệu (cắt khoảng trắng và đưa về chữ thường)
      const contactInfo = match[1].trim().toLowerCase(); 

      // Lưới lọc bảo vệ: Chống lưu chuỗi rác do AI bị "ảo giác" sinh ra
      const isFakeData = contactInfo.includes('<') || contactInfo.includes('>');
      const isValidLength = contactInfo.length >= 8;

      if (!isFakeData && isValidLength) {
        try {
          // Lấy 2 câu chat gần nhất để làm Context
          const context = chatHistory.slice(-2).map(msg => `${msg.role}: ${msg.text}`).join(' | ');
          
          // Tìm kiếm khách hàng bằng Regex để KHÔNG phân biệt chữ hoa/thường
          const existingLead = await this.advisoryModel.findOne({ 
            contact_info: { $regex: new RegExp(`^${contactInfo}$`, 'i') } 
          });

          if (existingLead) {
            //  NẾU KHÁCH ĐÃ TỒN TẠI: Cập nhật dòng cũ thay vì tạo mới
            existingLead.status = 'NEW'; // Đẩy về MỚI để Admin chú ý
            existingLead.is_returning = true; // Đánh dấu đây là khách quay lại
            
            // Nối thêm lịch sử chat mới xuống dưới cùng
            existingLead.chat_history = existingLead.chat_history + '\n\n--- [Nhắn tin lần sau] ---\n' + `${context} | user: ${newMessage}`;
            
            await existingLead.save();
            console.log(` Đã cập nhật yêu cầu từ Khách cũ: ${contactInfo}`);
            
          } else {
            //  NẾU KHÁCH MỚI TINH: Tạo một bản ghi hoàn toàn mới
            await this.advisoryModel.create({
              contact_info: contactInfo,
              is_returning: false,
              status: 'NEW',
              chat_history: `${context} | user: ${newMessage}`
            });
            console.log(` Đã bắt được Khách hàng mới: ${contactInfo}`);
          }
        } catch (error) {
          console.error('Lỗi khi xử lý Lead:', error);
        }
      }
      //  Luôn luôn xóa mã ẩn đi trước khi trả kết quả về cho React
      aiResponse = aiResponse.replace(leadRegex, '').trim();
    }

    return { success: true, reply: aiResponse };
  }

  // Lấy danh sách Leads có phân trang (Dành cho Admin)
  async getAllLeadsAdvisories(page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;

    // 1. CHUẨN BỊ BỘ LỌC (Lọc theo Tab)
    const query: any = {};
    if (status && status !== 'ALL') {
      query.status = status; 
    }

    const [leads, totalFiltered, totalAll, totalNew,totalContacted, totalResolved] = await Promise.all([
      this.advisoryModel.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).exec(), 
      this.advisoryModel.countDocuments(query).exec(), 
      
      // Đếm riêng cho 3 Thẻ Thống kê
      this.advisoryModel.countDocuments().exec(), 
      this.advisoryModel.countDocuments({ status: 'NEW' }).exec(),
      this.advisoryModel.countDocuments({ status: 'CONTACTED' }).exec(),
      this.advisoryModel.countDocuments({ status: 'RESOLVED' }).exec(),
    ]);

    return {
      data: leads,
      meta: {
        totalItems: totalFiltered, 
        stats: { 
          totalAll,
          totalNew,
          totalContacted,
          totalResolved
        }
      },
    };
  }

  // Cập nhật trạng thái Khách hàng tư vấn
  async updateAdvisoryStatus(id: string, status: string) {
    const validStatuses = ['NEW', 'CONTACTED', 'RESOLVED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Trạng thái không hợp lệ');
    }

    const updatedLead = await this.advisoryModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedLead) {
      throw new BadRequestException('Không tìm thấy yêu cầu tư vấn này');
    }

    return { success: true, message: 'Cập nhật trạng thái thành công', data: updatedLead };
  }
}
