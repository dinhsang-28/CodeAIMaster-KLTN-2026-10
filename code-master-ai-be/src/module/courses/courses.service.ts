import { InjectModel } from '@nestjs/mongoose';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import { Model, Types } from 'mongoose';
import { CourseDocument } from './entities/course.entity';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CourseLevel } from './enums/courseLevel.enum';
import { CourseStatus } from './enums/courseStatus.enum';
import { NotFoundException } from '@nestjs/common';
import { Category } from '../categories/entities/category.entity';
import { CategoryDocument } from '../categories/entities/category.entity';
import { ApiResponse } from '@/common/dto/api-response.dto';
import { Lesson, LessonDocument } from '../lessons/entities/lesson.entity';
import { SearchCourse } from './dto/search-course.dto';
import { filter } from 'rxjs';
import { UploadService } from '@/upload/upload.service';
import {
  Assignment,
  AssignmentDocument,
} from '../assignments/entities/assignment.entity';
import { Quiz, QuizDocument } from '../quizzes/entities/quiz.entity';
import {
  Question,
  QuestionDocument,
} from '../questions/entities/question.entity';
import {
  CodeAssignment,
  CodeAssignmentDocument,
} from '../code-assignments/entities/code-assignment.entity';
import {
  CartDetail,
  CartDetailDocument,
} from '../cart-details/entities/cart-detail.entity';
import { ProgressService } from '../progress/progress.service';
import { UserLessonProgress, UserLessonProgressDocument } from '../user-lesson-progress/entities/user-lesson-progress.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,

    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,

    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,

    @InjectModel(Assignment.name)
    private readonly assignmentModel: Model<AssignmentDocument>,

    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,

    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,

    @InjectModel(CartDetail.name)
    private readonly cartDetailModel: Model<CartDetailDocument>,

    @InjectModel(CodeAssignment.name)
    private readonly codeAssignmentModel: Model<CodeAssignmentDocument>,

    @InjectModel(UserLessonProgress.name)
    private readonly userLessonProgressModel: Model<UserLessonProgressDocument>,

    private readonly progressService: ProgressService,

    private readonly uploadService: UploadService,
  ) {}
  async create(
    createCourseDto: CreateCourseDto,
    file?: Express.Multer.File,
  ): Promise<Course> {
    const category = await this.categoryModel.findById(
      createCourseDto.category,
    );
    if (!category) {
      throw new NotFoundException('Cant search Category in Course');
    }
    let thumbnailUrl = createCourseDto.thumbnail || '';
    if (file) {
      const uploadResult = await this.uploadService.uploadFile(file);
      thumbnailUrl = uploadResult.url;
    }
    const createCourse = await this.courseModel.create({
      ...createCourseDto,
      thumbnail: thumbnailUrl,
      level: CourseLevel.BEGINNER,
      status: CourseStatus.ACTIVE,
    });
    return createCourse;
  }

  async findAll(): Promise<ApiResponse<Course[]>> {
    const courses = await this.courseModel
      .find()
      .populate('category', 'category_name')
      .lean()
      .exec();
    return new ApiResponse('Danh sách khóa học', courses);
  }

  // async findOne(id: string): Promise<Course> {
  //   const course = await this.courseModel.findById(id).populate("category", "category_name");
  //   if (!course) {
  //     throw new UnauthorizedException('Course not exist');
  //   }
  //   return course;
  // }

  async findOne(id: string): Promise<ApiResponse<any>> {
    const course = await this.courseModel
      .findById(id)
      .populate('category', 'category_name')
      .lean();

    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học');
    }

    const lessons = await this.lessonModel
      .find({ course_id: id })
      .sort({ lesson_order: 1 })
      .lean();

    return new ApiResponse('Chi tiết khóa học', {
      ...course,
      lessons,
    });
  }

  async getCourseInfo(id: string): Promise<ApiResponse<any>> {
    const course = await this.courseModel
      .findById(id)
      .populate('category', 'category_name')
      .lean()
      .exec();

    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học');
    }

    const lessons = await this.lessonModel
      .find({ course_id: id })
      .sort({ lesson_order: 1 })
      .lean()
      .exec();

    const lessonIds = lessons.map((lesson) => lesson._id);
    const lessonIdStrings = lessonIds.map((id) => String(id));
    const lessonObjectIds = lessonIdStrings
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));
    const assignments = await this.assignmentModel
      .find({
        $or: [
          { lesson_id: { $in: lessonObjectIds } },
          { lesson_id: { $in: lessonIdStrings } },
        ],
      })
      .lean()
      .exec();

    const assignmentIds = assignments.map((assignment) => assignment._id);

    const [quizzes, codeAssignments] = await Promise.all([
      this.quizModel
        .find({ assignment_id: { $in: assignmentIds } })
        .lean()
        .exec(),
      this.codeAssignmentModel
        .find({ assignment_id: { $in: assignmentIds } })
        .lean()
        .exec(),
    ]);

    const codeAssignmentByAssignmentId = new Map<string, any>();
    for (const codeAssignment of codeAssignments) {
      codeAssignmentByAssignmentId.set(String(codeAssignment.assignment_id), codeAssignment);
    }

    const quizIds = quizzes.map((quiz) => quiz._id);
    const questions = await this.questionModel
      .find({ quiz_id: { $in: quizIds } })
      .lean()
      .exec();

    const questionsByQuizId = new Map<string, any[]>();
    for (const question of questions) {
      const key = String(question.quiz_id);
      if (!questionsByQuizId.has(key)) {
        questionsByQuizId.set(key, []);
      }
      questionsByQuizId.get(key)!.push(question);
    }

    const quizzesByAssignmentId = new Map<string, any[]>();
    for (const quiz of quizzes) {
      const quizWithQuestions = {
        ...quiz,
        questions: questionsByQuizId.get(String(quiz._id)) || [],
      };
      const key = String(quiz.assignment_id);
      if (!quizzesByAssignmentId.has(key)) {
        quizzesByAssignmentId.set(key, []);
      }
      quizzesByAssignmentId.get(key)!.push(quizWithQuestions);
    }

    const assignmentsByLessonId = new Map<string, any[]>();
    for (const assignment of assignments) {
      const assignmentId = String(assignment._id);
      const enrichedAssignment = {
        ...assignment,
        quizzes: quizzesByAssignmentId.get(assignmentId) || [],
        codeAssignment: codeAssignmentByAssignmentId.get(assignmentId) || null,
        codeAssignmentId: codeAssignmentByAssignmentId.get(assignmentId)?._id || null,
      };

      const lessonKey = String(assignment.lesson_id);
      if (!assignmentsByLessonId.has(lessonKey)) {
        assignmentsByLessonId.set(lessonKey, []);
      }
      assignmentsByLessonId.get(lessonKey)!.push(enrichedAssignment);
    }

    const lessonDetails = lessons.map((lesson) => {
      const lessonAssignments =
        assignmentsByLessonId.get(String(lesson._id)) || [];
      return {
        ...lesson,
        assignments: lessonAssignments,
        assignment_ids: lessonAssignments.map((item) => item._id),
      };
    });

    return new ApiResponse('Thông tin đầy đủ khóa học', {
      ...course,
      lessons: lessonDetails,
    });
  }

  async getLearningCourse(id: string, userId: string): Promise<ApiResponse<any>> {
    const course = await this.courseModel
      .findById(id)
      .populate('category', 'category_name')
      .lean()
      .exec();

    if (!course) {
      throw new NotFoundException('Không tìm thấy khóa học');
    }

    const lessons = await this.lessonModel
      .find({ course_id: id })
      .sort({ lesson_order: 1 })
      .lean()
      .exec();

    const lessonIds = lessons.map((lesson) => lesson._id);
    const lessonIdStrings = lessonIds.map((lid) => String(lid));
    const lessonObjectIds = lessonIdStrings
      .filter((lid) => Types.ObjectId.isValid(lid))
      .map((lid) => new Types.ObjectId(lid));
      
    const assignments = await this.assignmentModel
      .find({
        $or: [
          { lesson_id: { $in: lessonObjectIds } },
          { lesson_id: { $in: lessonIdStrings } },
        ],
      })
      .lean()
      .exec();

    const assignmentIds = assignments.map((assignment) => assignment._id);

    const [quizzes, codeAssignments] = await Promise.all([
      this.quizModel
        .find({ assignment_id: { $in: assignmentIds } })
        .lean()
        .exec(),
      this.codeAssignmentModel
        .find({ assignment_id: { $in: assignmentIds } })
        .lean()
        .exec(),
    ]);

    const quizIds = quizzes.map((quiz) => quiz._id);
    const questions = await this.questionModel
      .find({ quiz_id: { $in: quizIds } })
      .lean()
      .exec();

    const questionsByQuizId = new Map<string, any[]>();
    for (const question of questions) {
      // Remove correct_answer for student endpoint
      const safeQuestion = { ...question };
      delete (safeQuestion as any).correct_answer;

      const key = String(question.quiz_id);
      if (!questionsByQuizId.has(key)) {
        questionsByQuizId.set(key, []);
      }
      questionsByQuizId.get(key)!.push(safeQuestion);
    }

    const quizzesByAssignmentId = new Map<string, any[]>();
    for (const quiz of quizzes) {
      const quizWithQuestions = {
        ...quiz,
        questions: questionsByQuizId.get(String(quiz._id)) || [],
      };
      const key = String(quiz.assignment_id);
      if (!quizzesByAssignmentId.has(key)) {
        quizzesByAssignmentId.set(key, []);
      }
      quizzesByAssignmentId.get(key)!.push(quizWithQuestions);
    }

    const codeAssignmentByAssignmentId = new Map<string, any>();
    for (const codeAssignment of codeAssignments) {
      codeAssignmentByAssignmentId.set(
        String(codeAssignment.assignment_id),
        codeAssignment,
      );
    }

    const assignmentsByLessonId = new Map<string, any[]>();
    for (const assignment of assignments) {
      const assignmentId = String(assignment._id);
      const enrichedAssignment = {
        ...assignment,
        quizzes: quizzesByAssignmentId.get(assignmentId) || [],
        codeAssignment: codeAssignmentByAssignmentId.get(assignmentId) || null,
      };

      const lessonKey = String(assignment.lesson_id);
      if (!assignmentsByLessonId.has(lessonKey)) {
        assignmentsByLessonId.set(lessonKey, []);
      }
      assignmentsByLessonId.get(lessonKey)!.push(enrichedAssignment);
    }

    // Fetch user progress
    const progresses = await this.userLessonProgressModel
      .find({
        userId: new Types.ObjectId(userId),
        courseId: new Types.ObjectId(id),
      })
      .lean()
      .exec();

    const progressByLessonId = new Map<string, any>();
    for (const prog of progresses) {
      progressByLessonId.set(String(prog.lessonId), prog);
    }

    let previousLessonCompleted = true; // First lesson is unlocked by default

    const lessonDetails = lessons.map((lesson) => {
      const lessonAssignments = assignmentsByLessonId.get(String(lesson._id)) || [];
      const lessonProgress = progressByLessonId.get(String(lesson._id));

      const isCompleted = lessonProgress ? lessonProgress.isCompleted : false;
      const watchPercent = lessonProgress ? lessonProgress.watchPercent : 0;
      const status = lessonProgress ? lessonProgress.status : 'NOT_STARTED';

      const canAccess = previousLessonCompleted;
      const isLocked = !canAccess;
      const reason = isLocked ? 'Vui lòng hoàn thành bài học trước đó' : null;

      previousLessonCompleted = isCompleted;

      return {
        ...lesson,
        assignments: lessonAssignments,
        assignment_ids: lessonAssignments.map((item) => item._id),
        progress: {
          status,
          watchPercent,
          isCompleted,
          completedAt: lessonProgress ? lessonProgress.completedAt : null,
        },
        access: {
          isLocked,
          canAccess,
          reason,
        }
      };
    });

    const courseProgress = await this.progressService.recalculate(userId, id);

    return new ApiResponse('Thông tin học khóa học', {
      course: course,
      progress: courseProgress,
      lessons: lessonDetails,
    });
  }

  // <<<<<<< HEAD
  //   async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
  // =======
  //   const lessons = await this.lessonModel
  //     .find({ course_id: id })
  //     .sort({ lesson_order: 1 })
  //     .lean();

  //   return new ApiResponse('Chi tiết khóa học', {
  //     ...course,
  //     lessons,
  //   });
  // }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    file?: Express.Multer.File,
  ): Promise<Course> {
    let thumbnailUrl = updateCourseDto.thumbnail;
    if (file) {
      const uploadResult = await this.uploadService.uploadFile(file);
      thumbnailUrl = uploadResult.url;
      updateCourseDto.thumbnail = thumbnailUrl;
    }

    const updated = await this.courseModel.findByIdAndUpdate(
      id,
      updateCourseDto,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!updated) {
      throw new NotFoundException('Course not found');
    }

    if (updateCourseDto.price !== undefined) {
      await this.cartDetailModel.updateMany(
        { course_id: new Types.ObjectId(id) },
        { $set: { price: updateCourseDto.price } },
      );
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.courseModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Course not found ');
  }

  //Tìm kiếm theo khoá học
  async searchCourses(search: SearchCourse) {
    // tìm kiếm
    const {
      keyword,
      level,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = search;

    const filter: any = { status: CourseStatus.ACTIVE };

    if (keyword) filter.title = { $regex: keyword, $options: 'i' };

    if (level) filter.level = level;

    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }

    // Phân trang (Pagination)
    const skip = (Number(page) - 1) * Number(limit);

    const data = await this.courseModel
      .find(filter)
      .skip(skip)
      .limit(Number(limit));

    const total = await this.courseModel.countDocuments(filter);

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
