import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz, QuizDocument } from './entities/quiz.entity';
import {
  Assignment,
  SchemaAssginment,
} from '../assignments/entities/assignment.entity';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,

    @InjectModel(Assignment.name)
    private readonly assignmentModel: Model<SchemaAssginment>,
  ) {}

  async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
    const assignment = await this.assignmentModel.findById(
      createQuizDto.assignment_id,
    );
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return this.quizModel.create(createQuizDto);
  }

  async findAll(assignment_id?: string): Promise<Quiz[]> {
    const filter: Record<string, any> = {};
    if (assignment_id) {
      if (!Types.ObjectId.isValid(assignment_id)) {
        throw new BadRequestException('assignment_id không hợp lệ');
      }
      filter.assignment_id = assignment_id;
    }

    return this.quizModel.find(filter).lean().exec();
  }

  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizModel.findById(id).lean().exec();
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    return quiz;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    if (updateQuizDto.assignment_id) {
      const assignment = await this.assignmentModel.findById(
        updateQuizDto.assignment_id,
      );
      if (!assignment) {
        throw new NotFoundException('Assignment not found');
      }
    }

    const updated = await this.quizModel.findByIdAndUpdate(id, updateQuizDto, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new NotFoundException('Quiz not found');
    }

    return updated.toObject();
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.quizModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Quiz not found');
    }
  }
}
