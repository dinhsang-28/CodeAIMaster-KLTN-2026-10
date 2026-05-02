import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Assignment, SchemaAssginment } from './entities/assignment.entity';
import { Model } from 'mongoose';
import { Lesson, LessonDocument } from '../lessons/entities/lesson.entity';
import { AssignmentType } from './enums/types.enum';
import { SearchAssignmentDto } from './dto/search-assigment.dto';
import { Quiz, QuizDocument } from '../quizzes/entities/quiz.entity';
import {
  CodeAssignment,
  CodeAssignmentDocument,
} from '../code-assignments/entities/code-assignment.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectModel(Assignment.name)
    private readonly assigmentModel: Model<SchemaAssginment>,

    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,

    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,

    @InjectModel(CodeAssignment.name)
    private readonly codeAssignmentModel: Model<CodeAssignmentDocument>,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const lesson = await this.lessonModel.findById(
      createAssignmentDto.lesson_id,
    );

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const assignmentType = createAssignmentDto.type ?? AssignmentType.QUIZ;

    const assignment = await this.assigmentModel.create({
      ...createAssignmentDto,
      type: assignmentType,
    });

    if (assignmentType === AssignmentType.QUIZ) {
      await this.quizModel.create({
        assignment_id: assignment._id,
        title: assignment.title,
        total_score: assignment.max_score ?? 10,
        time_limit: 15,
      });
    }

    if (assignmentType === AssignmentType.CODEASSIGNMENT) {
      await this.codeAssignmentModel.create({
        assignment_id: assignment._id,
        title: assignment.title,
        problem_description: assignment.description || assignment.title,
        input_format: '',
        output_format: '',
        time_limit: 2,
        memory_limit: 128000,
        starter_code: 'function solve() {\n  \n}',
        language_support: 'javascript',
      });
    }

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
    const assigment = await this.assigmentModel.findByIdAndUpdate(
      id,
      updateAssignmentDto,
      { new: true },
    );
    if (!assigment)
      throw new NotFoundException('Assignment not found and cant update');
    return assigment;
  }

  async remove(id: string): Promise<void> {
    const assignment = await this.assigmentModel.findByIdAndDelete(id);
    if (!assignment) throw new NotFoundException('Assignment not exist');
  }

  async searchAssignments(search: SearchAssignmentDto) {
    const { keyword, lesson_id, type, page = 1, limit = 10 } = search;

    const filter: any = {};
    if (keyword) filter.title = { $regex: keyword, $options: 'i' };

    if (lesson_id) filter.lesson_id = lesson_id;

    if (type) filter.type = type;

    // Phân trang
    const skip = (Number(page) - 1) * Number(limit);

    const data = await this.assigmentModel.find(filter).skip(skip).limit(limit);

    const total = await this.assigmentModel.countDocuments(filter);

    const sumPage = Math.ceil(total / Number(limit));

    return {
      data,
      page: page,
      limit: limit,
      total,
      sumPage,
    };
  }
}
