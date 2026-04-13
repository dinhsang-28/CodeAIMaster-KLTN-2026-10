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
    const assignment = await this.assignmentModel.findById(
      createCodeAssignmentDto.assignment_id,
    );
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return this.codeAssignmentModel.create(createCodeAssignmentDto);
  }

  async findAll(assignment_id?: string): Promise<CodeAssignment[]> {
    const filter: Record<string, any> = {};
    if (assignment_id) {
      if (!Types.ObjectId.isValid(assignment_id)) {
        throw new BadRequestException('assignment_id không hợp lệ');
      }
      filter.assignment_id = assignment_id;
    }

    return this.codeAssignmentModel.find(filter).lean().exec();
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
