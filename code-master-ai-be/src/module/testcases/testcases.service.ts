import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTestcaseDto } from './dto/create-testcase.dto';
import { UpdateTestcaseDto } from './dto/update-testcase.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TestCase, TestCaseDocument } from './entities/testcase.entity';
import { Model, Types } from 'mongoose';
import {
  Assignment,
  AssignmentDocument,
} from '../assignments/entities/assignment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import {
  CodeAssignment,
  CodeAssignmentDocument,
} from '../code-assignments/entities/code-assignment.entity';
import { AiAssistantService } from '@/ai-assistant/ai-assistant.service';

@Injectable()
export class TestcasesService {
  private genAI: GoogleGenerativeAI | null;
  private readonly aiApiKey: string;
  constructor(
    @InjectModel(TestCase.name) private testCaseModel: Model<TestCaseDocument>,
    @InjectModel(Assignment.name)
    private assignmentModel: Model<AssignmentDocument>,
    @InjectModel(CodeAssignment.name)
    private codeAssignmentModel: Model<CodeAssignmentDocument>,
    private readonly aiAssistantService: AiAssistantService,
  ) {
    this.aiApiKey = (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '').trim();
    this.genAI = this.aiApiKey ? new GoogleGenerativeAI(this.aiApiKey) : null;
  }
  // async generateTestCaseByAI(
  //   assignmentId: string,
  //   solutionCode: string,
  //   constraints: string,
  //   numberOfTestCases: number = 5,
  //   hiddenTestCases?: number,
  // ) {
  //   console.log('[generate-ai] incoming assignmentId=', assignmentId);
  //   console.log('[generate-ai] incoming numberOfTestCases=', numberOfTestCases);
  //   console.log('[generate-ai] incoming hiddenTestCases=', hiddenTestCases);

  //   if (!Types.ObjectId.isValid(assignmentId)) {
  //     console.log('[generate-ai] invalid assignmentId');
  //     throw new BadRequestException('assignmentId không hợp lệ');
  //   }

  //   const assignmentObjectId = new Types.ObjectId(assignmentId);
  //   const assignment = await this.assignmentModel.findById(assignmentObjectId).lean().exec();
  //   console.log('[generate-ai] assignment found=', Boolean(assignment));
  //   if (!assignment) {
  //     throw new BadRequestException('Không tìm thấy assignment cho bài tập này.');
  //   }

  //   const codeAssignmentExact = await this.codeAssignmentModel
  //     .findOne({ assignment_id: assignmentObjectId })
  //     .lean()
  //     .exec();

  //   const codeAssignmentFallback = codeAssignmentExact
  //     ? null
  //     : await this.codeAssignmentModel
  //         .find({
  //           $or: [
  //             { assignment_id: assignmentObjectId },
  //             { assignment_id: assignmentId },
  //             { assignmentId: assignmentId },
  //           ],
  //         })
  //         .limit(5)
  //         .lean()
  //         .exec();

  //   const codeAssignment = codeAssignmentExact || codeAssignmentFallback?.[0] || null;
  //   console.log('[generate-ai] codeAssignment exact found=', Boolean(codeAssignmentExact));
  //   console.log('[generate-ai] codeAssignment fallback count=', codeAssignmentFallback?.length || 0);
  //   console.log('[generate-ai] codeAssignment resolved=', Boolean(codeAssignment));

  //   if (!codeAssignment) {
  //     throw new BadRequestException('Bài tập này chưa có CodeAssignment để sinh testcase.');
  //   }
  //   if (!this.genAI) {
  //     console.error('[generate-ai] missing AI api key. GEMINI_API_KEY/OPENAI_API_KEY is empty');
  //     throw new BadRequestException('Chưa cấu hình AI API key.');
  //   }
  //   // 2. Thiết lập Prompt ép AI trả về chuẩn cấu trúc DB của bạn
  //   const prompt = `
  //     Bạn là chuyên gia thuật toán. Hãy tạo ra ${numberOfTestCases} test cases cho bài toán sau.
      
  //     THÔNG TIN BÀI TOÁN:
  //     - Tên bài: ${codeAssignment.title}
  //     - Mô tả: ${codeAssignment.problem_description}
  //     - Giới hạn: ${constraints}
  //     - Code giải chuẩn: \n${solutionCode}

  //     YÊU CẦU BẮT BUỘC:
  //     1. Kết quả (expected_output) phải chuẩn xác 100% dựa trên Code giải chuẩn.
  //     2. 2 test cases đầu tiên set "is_hidden": false. Các test cases còn lại set "is_hidden": true.
  //     3. CHỈ TRẢ VỀ JSON ARRAY, KHÔNG ĐƯỢC CÓ BẤT KỲ VĂN BẢN NÀO KHÁC.
  //     4. Nếu hiddenTestCases được truyền vào và lớn hơn 0, hãy tạo đúng số testcase ẩn tương ứng.

  //     Cấu trúc JSON mong muốn:
  //     [
  //       {
  //         "input_data": "giá trị truyền vào",
  //         "expected_output": "kết quả in ra",
  //         "is_hidden": boolean
  //       }
  //     ]
  //   `;
  //   try {
  //     const model = this.genAI!.getGenerativeModel({
  //       model: 'gemini-2.5-flash-lite',
  //     });
  //     const result = await model.generateContent(prompt);
  //     const rawText = result.response.text();
  //     console.log('[generate-ai] raw ai response=', rawText);
  //     let textResponse = rawText
  //       .replace(/```json/g, '')
  //       .replace(/```/g, '')
  //       .trim();

  //     const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
  //     if (jsonMatch) {
  //       textResponse = jsonMatch[0];
  //     }

  //     let parsedTestCases: any;
  //     try {
  //       parsedTestCases = JSON.parse(textResponse);
  //     } catch (parseError) {
  //       console.error('[generate-ai] parse failed raw response=', rawText);
  //       throw new BadRequestException('AI trả về dữ liệu không phải JSON hợp lệ.');
  //     }

  //     const normalizedTestCases = Array.isArray(parsedTestCases)
  //       ? parsedTestCases
  //       : [];

  //     const hiddenCount = typeof hiddenTestCases === 'number' && hiddenTestCases >= 0
  //       ? hiddenTestCases
  //       : Math.max(numberOfTestCases - 2, 0);

  //     const testCasesToSave = normalizedTestCases.map((tc, index) => ({
  //       assignment_id: new Types.ObjectId(assignment._id),
  //       code_assignment_id: new Types.ObjectId(codeAssignment._id),
  //       input_data: String(tc.input_data ?? '').trim(),
  //       expected_output: String(tc.expected_output ?? '').trim(),
  //       is_hidden: typeof tc.is_hidden === 'boolean' ? tc.is_hidden : index >= (numberOfTestCases - hiddenCount),
  //     }));

  //     const deduped = testCasesToSave.filter((tc, index, self) =>
  //       index === self.findIndex((item) => item.input_data === tc.input_data && item.expected_output === tc.expected_output),
  //     );

  //     const savedTestCases = await this.testCaseModel.insertMany(deduped);

  //     return {
  //       message: `Đã tự động tạo và lưu ${savedTestCases.length} Test Cases thành công!`,
  //       data: savedTestCases,
  //     };
  //   } catch (error) {
  //     console.error(error);
  //     throw new BadRequestException(
  //       'AI tạo Test Case thất bại, vui lòng thử lại hoặc kiểm tra prompt.',
  //     );
  //   }
  // }
  async generateTestCaseByAI(
    assignmentId: string,
    solutionCode: string,
    constraints: string,
    numberOfTestCases: number = 5,
    hiddenTestCases?: number,
  ) {
    if (!Types.ObjectId.isValid(assignmentId)) {
      throw new BadRequestException('assignmentId không hợp lệ');
    }

    const assignmentObjectId = new Types.ObjectId(assignmentId);
    const assignment = await this.assignmentModel.findById(assignmentObjectId).lean().exec();
    if (!assignment) {
      throw new BadRequestException('Không tìm thấy assignment cho bài tập này.');
    }

    const codeAssignment = await this.codeAssignmentModel
      .findOne({ assignment_id: assignmentObjectId })
      .lean()
      .exec();

    if (!codeAssignment) {
      throw new BadRequestException('Bài tập này chưa có CodeAssignment để sinh testcase.');
    }

    if (!this.genAI) {
      throw new BadRequestException('Chưa cấu hình AI API key.');
    }

    //  Cải tiến Prompt để AI không sinh ra Object và bỏ chữ "Kết quả:"
    const prompt = `
      Bạn là chuyên gia thuật toán. Hãy tạo ra ${numberOfTestCases} test cases cho bài toán sau.
      
      THÔNG TIN BÀI TOÁN:
      - Tên bài: ${codeAssignment.title}
      - Mô tả: ${codeAssignment.problem_description}
      - Giới hạn: ${constraints}
      - Code giải chuẩn: \n${solutionCode}

      YÊU CẦU BẮT BUỘC:
      1. "input_data" PHẢI LÀ CHUỖI (STRING). Các giá trị cách nhau bởi dấu cách. Ví dụ: "5 10". KHÔNG được dùng object {}.
      2. "expected_output" PHẢI LÀ CHUỖI (STRING). Chỉ chứa kết quả cuối cùng, KHÔNG kèm văn bản như "Kết quả: ". Ví dụ: "15".
      3. 2 test cases đầu tiên set "is_hidden": false. Các test cases còn lại set "is_hidden": true.
      4. CHỈ TRẢ VỀ JSON ARRAY, KHÔNG GIẢI THÍCH.

      Cấu trúc JSON mẫu:
      [
        {
          "input_data": "5 10",
          "expected_output": "15",
          "is_hidden": false
        }
      ]
    `;

    try {
      const model = this.genAI!.getGenerativeModel({
        model: 'gemini-2.5-flash-lite', // Dòng model này ổn định cho JSON
      });
      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      
      let textResponse = rawText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) textResponse = jsonMatch[0];

      let parsedTestCases: any[] = JSON.parse(textResponse);

      const hiddenCount = typeof hiddenTestCases === 'number' && hiddenTestCases >= 0
        ? hiddenTestCases
        : Math.max(numberOfTestCases - 2, 0);

      // 2. Xử lý dữ liệu linh hoạt (Map và ép kiểu)
      const testCasesToSave = parsedTestCases.map((tc, index) => {
        let inputStr = '';
        
        // Nếu AI lỡ trả về object {"a": 10, "b": 20}, ta nối thành "10 20"
        if (tc.input_data && typeof tc.input_data === 'object') {
          inputStr = Object.values(tc.input_data).join(' ');
        } else {
          inputStr = String(tc.input_data ?? '').trim();
        }

        // Loại bỏ chữ "Kết quả: " nếu AI quên không tuân thủ prompt
        let outputStr = String(tc.expected_output ?? '').trim();
        outputStr = outputStr.replace(/Kết quả:\s*/i, '');

        return {
          assignment_id: assignmentObjectId,
          code_assignment_id: codeAssignment._id,
          input_data: inputStr,
          expected_output: outputStr,
          is_hidden: typeof tc.is_hidden === 'boolean' 
            ? tc.is_hidden 
            : index >= (parsedTestCases.length - hiddenCount),
        };
      });

      // 3. Lưu vào DB
      const savedTestCases = await this.testCaseModel.insertMany(testCasesToSave);

      return {
        message: `Đã tự động tạo và lưu ${savedTestCases.length} Test Cases thành công!`,
        data: savedTestCases,
      };
    } catch (error) {
      console.error('[generate-ai] Error:', error);
      throw new BadRequestException('AI tạo dữ liệu không hợp lệ, vui lòng thử lại.');
    }
  }
  //đang test
//   async generateTestCaseByAI(
//   assignmentId: string,
//   solutionCode: string,
//   constraints: string,
//   numberOfTestCases: number = 5,
//   hiddenTestCases?: number,
// ) {
//   if (!Types.ObjectId.isValid(assignmentId)) {
//     throw new BadRequestException('assignmentId không hợp lệ');
//   }

//   const assignmentObjectId = new Types.ObjectId(assignmentId);
//   const assignment = await this.assignmentModel
//     .findById(assignmentObjectId)
//     .lean()
//     .exec();

//   if (!assignment) {
//     throw new BadRequestException('Không tìm thấy assignment cho bài tập này.');
//   }

//   const codeAssignment = await this.codeAssignmentModel
//     .findOne({ assignment_id: assignmentObjectId })
//     .lean()
//     .exec();

//   if (!codeAssignment) {
//     throw new BadRequestException('Bài tập này chưa có CodeAssignment để sinh testcase.');
//   }

//   try {
//     // Gọi qua AiAssistantService → tự động key rotation
//     const parsedTestCases = await this.aiAssistantService.generateTestCases(
//       codeAssignment.title,
//       codeAssignment.problem_description,
//       constraints,
//       solutionCode,
//       numberOfTestCases,
//     );

//     const hiddenCount =
//       typeof hiddenTestCases === 'number' && hiddenTestCases >= 0
//         ? hiddenTestCases
//         : Math.max(numberOfTestCases - 2, 0);

//     // Gắn thêm assignment_id và code_assignment_id trước khi lưu
//     const testCasesToSave = parsedTestCases.map((tc, index) => ({
//       ...tc,
//       assignment_id: assignmentObjectId,
//       code_assignment_id: codeAssignment._id,
//       // Ghi đè is_hidden nếu caller truyền hiddenTestCases cụ thể
//       is_hidden:
//         typeof hiddenTestCases === 'number'
//           ? index >= parsedTestCases.length - hiddenCount
//           : tc.is_hidden,
//     }));

//     const savedTestCases = await this.testCaseModel.insertMany(testCasesToSave);

//     return {
//       message: `Đã tự động tạo và lưu ${savedTestCases.length} Test Cases thành công!`,
//       data: savedTestCases,
//     };
//   } catch (error) {
//     this.logger.error('[generate-ai] Error:', error);
//     throw new BadRequestException('AI tạo dữ liệu không hợp lệ, vui lòng thử lại.');
//   }
// }
  async findAll(code_assignment_id?: string): Promise<TestCase[]> {
    const filter: Record<string, any> = {};
    if (code_assignment_id) {
      if (!Types.ObjectId.isValid(code_assignment_id)) {
        throw new BadRequestException('code_assignment_id không hợp lệ');
      }
      filter.code_assignment_id = new Types.ObjectId(code_assignment_id);
    }

    return this.testCaseModel.find(filter).lean().exec();
  }

  async getPublicTestCases(code_assignment_id: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(code_assignment_id)) {
      throw new BadRequestException('code_assignment_id không hợp lệ');
    }

    const testCases = await this.testCaseModel
      .find({ code_assignment_id: new Types.ObjectId(code_assignment_id) })
      .lean()
      .exec();

    // Map over test cases and remove expected_output if it's hidden
    return testCases.map(tc => {
      if (tc.is_hidden) {
        return {
          ...tc,
          expected_output: undefined,
        };
      }
      return tc;
    });
  }

  // async create(createTestcaseDto: CreateTestcaseDto): Promise<TestCase> {
  //   const codeAssignment = await this.codeAssignmentModel.findById(
  //     createTestcaseDto.code_assignment_id,
  //   ).lean().exec();
  //   if (!codeAssignment) {
  //     throw new NotFoundException('CodeAssignment not found');
  //   }

  //   return this.testCaseModel.create(createTestcaseDto);
  // }
  async create(createTestcaseDto: CreateTestcaseDto): Promise<TestCase> {
  const codeAssignment = await this.codeAssignmentModel.findById(
    createTestcaseDto.code_assignment_id,
  ).lean().exec();

  if (!codeAssignment) {
    throw new NotFoundException('CodeAssignment not found');
  }

  // Gán assignment_id từ CodeAssignment vào data trước khi tạo
  const newTestCaseData = {
    ...createTestcaseDto,
    assignment_id: codeAssignment.assignment_id, // Lấy reference từ assignment cha
  };

  return this.testCaseModel.create(newTestCaseData);
}
  async findOne(id: string): Promise<TestCase> {
    const testCase = await this.testCaseModel.findById(id).lean().exec();
    if (!testCase) {
      throw new NotFoundException('TestCase not found');
    }
    return testCase;
  }

  // async update(
  //   id: string,
  //   updateTestcaseDto: UpdateTestcaseDto,
  // ): Promise<TestCase> {
  //   if (updateTestcaseDto.code_assignment_id) {
  //     const codeAssignment = await this.codeAssignmentModel.findById(
  //       updateTestcaseDto.code_assignment_id,
  //     );
  //     if (!codeAssignment) {
  //       throw new NotFoundException('CodeAssignment not found');
  //     }
  //   }

  //   const updated = await this.testCaseModel.findByIdAndUpdate(
  //     id,
  //     updateTestcaseDto,
  //     { new: true, runValidators: true },
  //   );

  //   if (!updated) {
  //     throw new NotFoundException('TestCase not found');
  //   }

  //   return updated.toObject();
  // }

  async update(id: string, updateTestcaseDto: UpdateTestcaseDto): Promise<TestCase> {
  let finalUpdateData = { ...updateTestcaseDto };

  if (updateTestcaseDto.code_assignment_id) {
    const codeAssignment = await this.codeAssignmentModel.findById(
      updateTestcaseDto.code_assignment_id,
    ).lean().exec();

    if (!codeAssignment) {
      throw new NotFoundException('CodeAssignment not found');
    }
    
    // Cập nhật luôn cả assignment_id cha
    finalUpdateData.assignment_id = codeAssignment.assignment_id.toString();
  }

  const updated = await this.testCaseModel.findByIdAndUpdate(
    id,
    finalUpdateData, // Sử dụng data đã xử lý
    { new: true, runValidators: true },
  );

  if (!updated) {
    throw new NotFoundException('TestCase not found');
  }

  return updated.toObject();
}

  async remove(id: string): Promise<void> {
    const deleted = await this.testCaseModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('TestCase not found');
    }
  }
}
