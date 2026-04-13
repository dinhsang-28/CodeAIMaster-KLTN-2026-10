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

@Injectable()
export class TestcasesService {
  private genAI: GoogleGenerativeAI;
  constructor(
    @InjectModel(TestCase.name) private testCaseModel: Model<TestCaseDocument>,
    @InjectModel(Assignment.name)
    private assignmentModel: Model<AssignmentDocument>,
    @InjectModel(CodeAssignment.name)
    private codeAssignmentModel: Model<CodeAssignmentDocument>,
  ) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }
  async generateTestCaseByAI(
    assignmentId: string,
    solutionCode: string,
    constraints: string,
    numberOfTestCases: number = 5,
  ) {
    const assignment = await this.assignmentModel.findById(assignmentId);
    if (!assignment) {
      throw new BadRequestException('khong tim thay bai tap');
    }
    // 2. Thiết lập Prompt ép AI trả về chuẩn cấu trúc DB của bạn
    const prompt = `
      Bạn là chuyên gia thuật toán. Hãy tạo ra ${numberOfTestCases} test cases cho bài toán sau.
      
      THÔNG TIN BÀI TOÁN:
      - Tên bài: ${assignment.title}
      - Mô tả: ${assignment.description}
      - Giới hạn: ${constraints}
      - Code giải chuẩn: \n${solutionCode}

      YÊU CẦU BẮT BUỘC:
      1. Kết quả (expected_output) phải chuẩn xác 100% dựa trên Code giải chuẩn.
      2. 2 test cases đầu tiên set "is_hidden": false. Các test cases còn lại set "is_hidden": true.
      3. CHỈ TRẢ VỀ JSON ARRAY, KHÔNG ĐƯỢC CÓ BẤT KỲ VĂN BẢN NÀO KHÁC.

      Cấu trúc JSON mong muốn:
      [
        {
          "input_data": "giá trị truyền vào",
          "expected_output": "kết quả in ra",
          "is_hidden": boolean
        }
      ]
    `;
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });
      const result = await model.generateContent(prompt); // Đã sửa lại lỗi await
      let textResponse = result.response.text();

      textResponse = textResponse
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      const parsedTestCases = JSON.parse(textResponse);

      const testCasesToSave = parsedTestCases.map((tc) => ({
        ...tc,
        assignment_id: new Types.ObjectId(assignmentId),
      }));

      const savedTestCases =
        await this.testCaseModel.insertMany(testCasesToSave);

      return {
        message: `Đã tự động tạo và lưu ${savedTestCases.length} Test Cases thành công!`,
        data: testCasesToSave,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(
        'AI tạo Test Case thất bại, vui lòng thử lại hoặc kiểm tra prompt.',
      );
    }
  }
  async findAll(code_assignment_id?: string): Promise<TestCase[]> {
    ``;
    const filter: Record<string, any> = {};
    if (code_assignment_id) {
      if (!Types.ObjectId.isValid(code_assignment_id)) {
        throw new BadRequestException('code_assignment_id không hợp lệ');
      }
      filter.code_assignment_id = code_assignment_id;
    }

    return this.testCaseModel.find(filter).lean().exec();
  }
  async create(createTestcaseDto: CreateTestcaseDto): Promise<TestCase> {
    const codeAssignment = await this.codeAssignmentModel.findById(
      createTestcaseDto.code_assignment_id,
    );
    if (!codeAssignment) {
      throw new NotFoundException('CodeAssignment not found');
    }

    return this.testCaseModel.create(createTestcaseDto);
  }
  async findOne(id: string): Promise<TestCase> {
    const testCase = await this.testCaseModel.findById(id).lean().exec();
    if (!testCase) {
      throw new NotFoundException('TestCase not found');
    }
    return testCase;
  }

  async update(
    id: string,
    updateTestcaseDto: UpdateTestcaseDto,
  ): Promise<TestCase> {
    if (updateTestcaseDto.code_assignment_id) {
      const codeAssignment = await this.codeAssignmentModel.findById(
        updateTestcaseDto.code_assignment_id,
      );
      if (!codeAssignment) {
        throw new NotFoundException('CodeAssignment not found');
      }
    }

    const updated = await this.testCaseModel.findByIdAndUpdate(
      id,
      updateTestcaseDto,
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
