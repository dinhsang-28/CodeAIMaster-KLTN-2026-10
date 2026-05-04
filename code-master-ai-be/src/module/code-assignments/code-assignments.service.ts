import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCodeAssignmentDto } from './dto/create-code-assignment.dto';
import { UpdateCodeAssignmentDto } from './dto/update-code-assignment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CodeAssignment,
  CodeAssignmentDocument,
} from './entities/code-assignment.entity';
import {
  Assignment,
  SchemaAssginment,
} from '../assignments/entities/assignment.entity';
import { AssignmentType } from '../assignments/enums/types.enum';

@Injectable()
export class CodeAssignmentsService {
  constructor(
    @InjectModel(CodeAssignment.name)
    private readonly codeAssignmentModel: Model<CodeAssignmentDocument>,

    @InjectModel(Assignment.name)
    private readonly assignmentModel: Model<SchemaAssginment>,
  ) {}

  async create(
    createCodeAssignmentDto: CreateCodeAssignmentDto,
  ): Promise<CodeAssignment> {
    if (!Types.ObjectId.isValid(createCodeAssignmentDto.assignment_id)) {
      throw new BadRequestException('assignment_id không hợp lệ');
    }

    const assignmentObjectId = new Types.ObjectId(createCodeAssignmentDto.assignment_id);
    const assignment = await this.assignmentModel.findById(assignmentObjectId).lean().exec();
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const existing = await this.codeAssignmentModel.findOne({
      assignment_id: assignmentObjectId,
    }).lean().exec();

    if (existing) {
      const updated = await this.codeAssignmentModel.findByIdAndUpdate(
        existing._id,
        {
          ...createCodeAssignmentDto,
          assignment_id: assignmentObjectId,
        },
        { new: true, runValidators: true },
      );
      if (!updated) {
        throw new BadRequestException('Không thể cập nhật code assignment hiện có');
      }
      return updated.toObject();
    }

    const created = await this.codeAssignmentModel.create({
      ...createCodeAssignmentDto,
      assignment_id: assignmentObjectId,
    });
    return created.toObject();
  }

  async findAll(assignment_id?: string): Promise<CodeAssignment[]> {
    const filter: Record<string, any> = {};
    if (assignment_id) {
      if (!Types.ObjectId.isValid(assignment_id)) {
        throw new BadRequestException('assignment_id không hợp lệ');
      }
      filter.assignment_id = assignment_id;
    }

    const records = await this.codeAssignmentModel.find(filter).lean().exec();
    if (records.length > 0) return records;

    // Fallback cho dữ liệu cũ/sai field assignment_id trong document
    if (assignment_id) {
      return this.codeAssignmentModel
        .find({
          $or: [
            { assignment_id },
            { assignmentId: assignment_id },
            { assignment_id: new Types.ObjectId(assignment_id) },
          ],
        })
        .lean()
        .exec();
    }

    return records;
  }

  async findOne(id: string): Promise<CodeAssignment> {
    const codeAssignment = await this.codeAssignmentModel
      .findById(id)
      .lean()
      .exec();
    if (!codeAssignment) {
      throw new NotFoundException('CodeAssignment not found');
    }
    return codeAssignment;
  }

  async update(
    id: string,
    updateCodeAssignmentDto: UpdateCodeAssignmentDto,
  ): Promise<CodeAssignment> {
    if (updateCodeAssignmentDto.assignment_id) {
      const assignment = await this.assignmentModel.findById(
        updateCodeAssignmentDto.assignment_id,
      );
      if (!assignment) {
        throw new NotFoundException('Assignment not found');
      }
      if (assignment.type !== AssignmentType.CODEASSIGNMENT) {
        throw new BadRequestException(
          'Assignment type must be "codeAssignment" to attach a code assignment',
        );
      }
    }

    const updated = await this.codeAssignmentModel.findByIdAndUpdate(
      id,
      updateCodeAssignmentDto,
      { new: true, runValidators: true },
    );

    if (!updated) {
      throw new NotFoundException('CodeAssignment not found');
    }

    return updated.toObject();
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.codeAssignmentModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('CodeAssignment not found');
    }
  }
}
