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
import { Course } from '../courses/entities/course.entity';
import { Advisory } from './entities/advisory.entity';

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
    private readonly aiAssistantService: AiAssistantService,
    private readonly httpService: HttpService,
  ) {}

 async submitCode(
    userId: string,
    assignmentId: string,
    language: string,
    sourceCode: string,
  ) {
    try {
      //  Ép kiểu assignmentId sang ObjectId
      const objectId = new Types.ObjectId(assignmentId);
      console.log("-===",objectId);

      // Tìm cấu hình chấm code
      const codeAssignment = await this.codeAssignmentModel.findOne({ _id: objectId });
      if (!codeAssignment) {
        throw new BadRequestException('Không tìm thấy cấu hình chấm code cho bài tập này.');
      }

      // Tìm Test Case
      const testCases = await this.testCaseModel
        .find({ assignment_id: objectId }) 
        .lean()
        .exec();

      console.log('Số lượng Test Case tìm được:', testCases.length);

      if (!testCases || testCases.length === 0) {
        throw new BadRequestException('Bài tập này chưa có Test Case nào để chấm điểm.');
      }

      //  Map ID ngôn ngữ
      // const languageMap = { python: 71, cpp: 54, java: 62, javascript: 63 };
      const normalizedLang = language.toLowerCase().trim();
      const languageId = JUDGE0_LANGUAGES[normalizedLang];
      if (!languageId) {
        throw new BadRequestException(`Hệ thống chưa hỗ trợ ngôn ngữ: ${language}`);
      }

      let passedCases = 0;
      let maxTime = 0;
      let maxMemory = 0;
      let finalStatus = 'ACCEPTED';
      let errorDetail:string | null = null;

      // HÀM DELAY ĐỂ HỖ TRỢ POLLING (Nghỉ một chút trước khi hỏi lại Judge0)
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      // Gửi lên Judge0 
      const judgePromises = testCases.map(async (testCase: any) => {
        const payload = {
          source_code: Buffer.from(sourceCode).toString('base64'),
          language_id: languageId,
          stdin: testCase.input_data ? Buffer.from(testCase.input_data).toString('base64') : null, 
          expected_output: testCase.expected_output ? Buffer.from(testCase.expected_output).toString('base64') : null,
          cpu_time_limit: codeAssignment.time_limit || 2.0,
          memory_limit: codeAssignment.memory_limit || 128000,
        };

        //  Gửi request lấy Token 
        const initResponse = await firstValueFrom(
          this.httpService.post(
            `${this.JUDGE0_URL}/submissions?base64_encoded=true&wait=false`,
            payload,
            { headers: { 'Content-Type': 'application/json' } },
          ),
        );
        
        const token = initResponse.data.token;
        let result: any = null;
        let statusId = 1; // 1: In Queue, 2: Processing

        //  Polling - Vòng lặp hỏi kết quả liên tục
        while (statusId === 1 || statusId === 2) {
          await delay(1000); // Nghỉ 1 giây để Judge0 kịp chayvà chấm bài
          
          const checkResponse = await firstValueFrom(
            this.httpService.get(
              `${this.JUDGE0_URL}/submissions/${token}?base64_encoded=true`
            )
          );
          
          result = checkResponse.data;
          statusId = result.status.id;
        }

        //  Có kết quả cuối cùng thì trả về
        return result;
      });

      const judgeResults = await Promise.all(judgePromises);
      
      console.log("=== KẾT QUẢ TỪ JUDGE0 ===");
      console.log(JSON.stringify(judgeResults, null, 2));
      console.log("=========================");

      //  Phân tích kết quả
      for (const result of judgeResults) {
        if (result.status.id === 3) {
          passedCases++;
        } else {
          if (result.status.id === 6) {
            finalStatus = 'COMPILATION_ERROR';
            errorDetail = result.compile_output 
              ? Buffer.from(result.compile_output, 'base64').toString('utf-8') 
              : 'Lỗi biên dịch không xác định';
            break;
          } else {
            if (finalStatus === 'ACCEPTED') {
              finalStatus = result.status.description.toUpperCase().replace(/ /g, '_');
            }
            if (!errorDetail && result.stderr) {
              errorDetail = Buffer.from(result.stderr, 'base64').toString('utf-8');
            }
          }
        }
        if (result.time && parseFloat(result.time) > maxTime) maxTime = parseFloat(result.time);
        if (result.memory && result.memory > maxMemory) maxMemory = result.memory;
      }

      // Lưu Submission 
      const newSubmission = await this.submissionModel.create({
        user_id: userId,        
        assignment_id: assignmentId, 
        language: language,
        code: sourceCode,       
        status: finalStatus,
        score: (passedCases / testCases.length) * 10, 
        ai_hint: null
      });

      return {
        message: 'Chấm bài hoàn tất',
        submission: newSubmission,
        passedCases,
        totalCases: testCases.length,
        compileError: errorDetail,
      };

    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error(error);
      throw new InternalServerErrorException('Lỗi hệ thống chấm bài.');
    }
  }
    // gia su tra loi khi nguoi dung muon hieu sai gi
  async requestAiTutor(submissionId:string){
    const submission = await this.submissionModel.findById(submissionId);
    if(!submission){
      throw new BadRequestException('khong tim thay lich su bai nop')
    }
    if(submission.status === 'ACCEPTED'){
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
        null
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
  async getRecommendationsForUser(userId: string) {
    //  Tìm các bài user đã nộp nhưng bị sai (WRONG_ANSWER, COMPILATION_ERROR)
    const failedSubmissions = await this.submissionModel
      .find({ user_id: userId, status: { $ne: 'ACCEPTED' } })
      .populate('assignment_id') // Join bảng để lấy thông tin bài tập
      .exec();

    // Gom tất cả các Tags mà user hay làm sai lại
    let weakTags: string[] = [];
    failedSubmissions.forEach(sub => {
      const assignment = sub.assignment_id as any;
      if (assignment && assignment.tags) {
        weakTags.push(...assignment.tags);
      }
    });

    // Nếu user chưa sai bài nào, trả về các bài dễ mặc định
    if (weakTags.length === 0) {
      const easyAssignments = await this.codeAssignmentModel.find({ difficulty: 'EASY' }).limit(5).exec();
      return {weakFocus: [], assignments: easyAssignments};
    }
     try {
      // lay toan bo bai tap trong dv de gui sang python phan tich
      const allAssignmentsRaw = await this.codeAssignmentModel.find().select('_id tags difficulty').lean().exec();
      // dinh dang lai data cho khop format ma python cho
      const allAssignments = allAssignmentsRaw.map(a=>({
        id:a._id.toString(),
        tags: a.tags || [],
        difficulty: a.difficulty || 'EASY'
      }))
      //GỌI SANG MICROSERVICE PYTHON BẰNG HTTP POST
      const pythonResponse = await firstValueFrom(
        this.httpService.post('http://localhost:8000/recommend', {
          weak_tags: weakTags,
          all_assignments: allAssignments
        })
      );

      const recommendedIds = pythonResponse.data.recommended_ids;

      // Nếu Python không tìm được bài nào phù hợp (hoặc báo lỗi logic)
      if(!recommendedIds || recommendedIds.length === 0){
        const backupAssignments = await this.codeAssignmentModel.find({ difficulty: 'EASY' }).limit(5).exec();
        return { weakFocus: weakTags, assignments: backupAssignments };
      }
      //. Query lại Database MongoDB để lấy thông tin chi tiết (tên bài, đề bài...) của các ID được gợi ý
      const finalRecommendations = await this.codeAssignmentModel
        .find({ _id: { $in: recommendedIds } })
        .exec();
        return {
          weakFocus: weakTags, // Báo cho frontend biết user đang yếu tag nào
        assignments: finalRecommendations // Trả danh sách bài tập ra
        }
      
     } catch (e) {
      console.error('Lỗi khi gọi Microservice Python AI:',);
      // Fallback: Nếu sập server Python hoặc lỗi mạng, hệ thống không được chết mà tự động trả về bài dễ
      const fallbackAssignments = await this.codeAssignmentModel.find({ difficulty: 'EASY' }).limit(5).exec();
      return { weakFocus: weakTags, assignments: fallbackAssignments };
      
     }

    // // 3. Nhờ AI phân tích xem yếu phần nào nhất
    // const recommendedTags = await this.aiAssistantService.recommendTags(weakTags);

    // // 4. Tìm trong Database các bài tập có Tag trùng với AI gợi ý
    // // Lấy ưu tiên các bài dễ (EASY) hoặc trung bình (MEDIUM)
    // const recommendedAssignments = await this.codeAssignmentModel
    //   .find({ 
    //     tags: { $in: recommendedTags }, // Tìm bài có chứa tag AI đề xuất
    //     difficulty: { $in: ['EASY', 'MEDIUM'] }
    //   })
    //   .limit(5)
    //   .exec();

    // return {
    //   weakFocus: recommendedTags, // Ví dụ: ['Array', 'For Loop']
    //   assignments: recommendedAssignments // Danh sách 5 bài tập trả về cho Frontend
    // };
  }
  async chatWithConsultant(
    chatHistory: { role: 'user' | 'model'; text: string }[],
    newMessage: string,
  ) {
    const courses = await this.courseModel.find({ status: 'active' })
      .select('_id title level price')
      .lean();

    // 1. Chèn thêm "Lệnh mật" vào hệ thống AI để nó tự bẫy khách hàng
    const systemInstruction = `
      Bạn là AI Tư Vấn của CodeMaster. Khách hàng đang chat với bạn.
      Danh sách khóa học: ${JSON.stringify(courses)}.
      
       LỆNH TỐI CAO VỀ THU THẬP THÔNG TIN: 
      1. Nếu khách hàng muốn đặt khóa học nhưng chưa cho thông tin: Hãy hỏi xin Số điện thoại hoặc Email một cách lịch sự. TUYỆT ĐỐI KHÔNG SỬ DỤNG thẻ [LEAD].
      2. CHỈ KHI NÀO khách hàng ĐÃ THỰC SỰ gõ ra Số điện thoại hoặc Email cụ thể, bạn mới được phép chèn đoạn mã này vào CUỐI câu: [LEAD: số_hoặc_email_của_khách]
      3. Tuyệt đối không bao giờ được trả về đoạn mã mẫu chứa dấu ngoặc nhọn như [LEAD: <số_điện_thoại>].
    `;

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
      this.advisoryModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(), 
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
