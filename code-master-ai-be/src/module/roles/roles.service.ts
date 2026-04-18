import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity'; 

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    try {
      const newRole = await this.roleModel.create(createRoleDto);
      return newRole;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException('Tên nhóm quyền này đã tồn tại!');
      }
      throw error;
    }
  }

  async findAll() {
    return await this.roleModel.find();
  }

  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không đúng định dạng MongoDB');
    }
    return await this.roleModel.findOne({ _id: id });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không đúng định dạng MongoDB');
    }
    try {
      return await this.roleModel.updateOne(
        { _id: id },
        { ...updateRoleDto }
      );
    } catch (error: any) {
       if (error.code === 11000) {
        throw new BadRequestException('Tên nhóm quyền này đã tồn tại!');
      }
      throw error;
    }
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('ID không đúng định dạng MongoDB');
    }
    return await this.roleModel.deleteOne({ _id: id });
  }

  //DÀNH CHO TÍNH NĂNG "LƯU BẢNG MA TRẬN PHÂN QUYỀN"
 
  async updateRolePermissions(roleId: string, permissions: string[]) {
    if (!mongoose.isValidObjectId(roleId)) {
      throw new BadRequestException('Role ID không đúng định dạng');
    }
    
    // Ghi đè mảng quyền mới vào cơ sở dữ liệu
    return await this.roleModel.updateOne(
      { _id: roleId },
      { $set: { permissions: permissions } }
    );
  }
}