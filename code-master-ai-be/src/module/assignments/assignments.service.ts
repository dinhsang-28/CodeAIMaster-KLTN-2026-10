import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Assignment, SchemaAssginment } from './entities/assignment.entity';
import { Model, Types } from 'mongoose';
import { Lesson, LessonDocument } from '../lessons/entities/lesson.entity';
import { AssignmentType } from './enums/types.enum';
import { SearchAssignmentDto } from './dto/search-assigment.dto';
import ExcelJS from 'exceljs';

const normalizeAssignmentType = (type?: string): AssignmentType | undefined => {
  if (!type) return undefined;

  const normalized = String(type).trim();
  if (normalized === AssignmentType.QUIZ) return AssignmentType.QUIZ;
  if (normalized === AssignmentType.CODEASSIGNMENT) return AssignmentType.CODEASSIGNMENT;

  return undefined;
};

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(Assignment.name)
    private readonly assigmentModel: Model<SchemaAssginment>,

    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const lesson = await this.lessonModel.findById(
      createAssignmentDto.lesson_id,
    );

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const assignmentType = normalizeAssignmentType(createAssignmentDto.type);

    if (!assignmentType) {
      throw new BadRequestException(
        'Assignment type is required and must be quiz or codeAssignment',
      );
    }

    const assignment = await this.assigmentModel.create({
      ...createAssignmentDto,
      type: assignmentType,
    });

    return assignment;
  }

  async findAll() {
    return await this.assigmentModel.find();
  }

  async findOne(id: string): Promise<Assignment> {
    const assignment = await this.assigmentModel.findById(id);
    if (!assignment) throw new NotFoundException('Assignment not exist');
    return assignment;
  }

  async update(
    id: string,
    updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<Assignment> {
    const payload = { ...updateAssignmentDto } as Record<string, any>;

    if (payload.type !== undefined) {
      const normalizedType = normalizeAssignmentType(payload.type);
      if (!normalizedType) {
        throw new BadRequestException('Assignment type must be quiz or codeAssignment');
      }
      payload.type = normalizedType;
    }

    const assigment = await this.assigmentModel.findByIdAndUpdate(id, payload, {
      new: true,
    });
    if (!assigment)
      throw new NotFoundException('Assignment not found and cant update');
    return assigment;
  }

  async remove(id: string): Promise<void> {
    const assignment = await this.assigmentModel.findByIdAndDelete(id);
    if (!assignment) throw new NotFoundException('Assignment not exist');
  }

  private async buildSearchFilter(search: SearchAssignmentDto) {
    const { keyword, course_id, lesson_id, type } = search;
    const filter: any = {};

    if (keyword) filter.title = { $regex: keyword, $options: 'i' };

    if (course_id) {
      const courseValues: any[] = [course_id];
      if (Types.ObjectId.isValid(course_id)) {
        courseValues.push(new Types.ObjectId(course_id));
      }

      const lessons = await this.lessonModel
        .find({ course_id: { $in: courseValues } })
        .select('_id')
        .lean();
      const lessonIds = lessons.flatMap((lesson) => [
        lesson._id,
        String(lesson._id),
      ]);
      filter.lesson_id = { $in: lessonIds };
    }

    if (lesson_id) {
      const lessonValues: any[] = [lesson_id];
      if (Types.ObjectId.isValid(lesson_id)) {
        lessonValues.push(new Types.ObjectId(lesson_id));
      }
      filter.lesson_id = { $in: lessonValues };
    }

    if (type) filter.type = type;

    return filter;
  }

  async searchAssignments(search: SearchAssignmentDto) {
    const { page = 1, limit = 10 } = search;
    const filter = await this.buildSearchFilter(search);

    // Phân trang
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const data = await this.assigmentModel
      .find(filter)
      .populate({
        path: 'lesson_id',
        populate: {
          path: 'course_id',
        },
      })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const normalizedData = data.map((assignment: any) => ({
      ...assignment,
      lesson: assignment.lesson_id ?? null,
      course: assignment.lesson_id?.course_id ?? null,
    }));

    const total = await this.assigmentModel.countDocuments(filter);

    const sumPage = Math.ceil(total / limitNumber);

    return {
      data: normalizedData,
      page: pageNumber,
      limit: limitNumber,
      total,
      sumPage,
    };
  }

  async exportAssignments(search: SearchAssignmentDto) {
    const filter = await this.buildSearchFilter(search);

    const assignments = await this.assigmentModel
      .find(filter)
      .populate({
        path: 'lesson_id',
        populate: {
          path: 'course_id',
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sach bai tap');

    worksheet.columns = [
      { header: 'STT', key: 'index', width: 8 },
      { header: 'Tên bài tập', key: 'title', width: 35 },
      { header: 'Loại', key: 'type', width: 18 },
      { header: 'Khóa học', key: 'course', width: 35 },
      { header: 'Bài học', key: 'lesson', width: 35 },
      { header: 'Điểm tối đa', key: 'maxScore', width: 14 },
      { header: 'Hạn nộp', key: 'dueDate', width: 20 },
      { header: 'Ngày tạo', key: 'createdAt', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };

    assignments.forEach((assignment: any, index) => {
      worksheet.addRow({
        index: index + 1,
        title: assignment.title || '',
        type:
          assignment.type === AssignmentType.QUIZ
            ? 'Bài tập thường'
            : 'Code Assignment',
        course: assignment.lesson_id?.course_id?.title || '',
        lesson: assignment.lesson_id?.title || '',
        maxScore: assignment.max_score ?? '',
        dueDate: assignment.due_date
          ? new Date(assignment.due_date).toLocaleDateString('vi-VN')
          : '',
        createdAt: assignment.createdAt
          ? new Date(assignment.createdAt).toLocaleDateString('vi-VN')
          : '',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer as ArrayBuffer);
  }
}
