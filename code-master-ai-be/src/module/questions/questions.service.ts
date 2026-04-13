import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question, QuestionDocument } from './entities/question.entity';
import { Quiz, QuizDocument } from '../quizzes/entities/quiz.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,

    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const quiz = await this.quizModel.findById(createQuestionDto.quiz_id);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return this.questionModel.create(createQuestionDto);
  }

  async findAll(quiz_id?: string): Promise<Question[]> {
    const filter: Record<string, any> = {};
    if (quiz_id) {
      if (!Types.ObjectId.isValid(quiz_id)) {
        throw new BadRequestException('quiz_id không hợp lệ');
      }
      filter.quiz_id = quiz_id;
    }

    return this.questionModel.find(filter).lean().exec();
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionModel.findById(id).lean().exec();
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    if (updateQuestionDto.quiz_id) {
      const quiz = await this.quizModel.findById(updateQuestionDto.quiz_id);
      if (!quiz) {
        throw new NotFoundException('Quiz not found');
      }
    }

    const updated = await this.questionModel.findByIdAndUpdate(
      id,
      updateQuestionDto,
      { new: true, runValidators: true },
    );

    if (!updated) {
      throw new NotFoundException('Question not found');
    }

    return updated.toObject();
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.questionModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Question not found');
    }
  }
}
