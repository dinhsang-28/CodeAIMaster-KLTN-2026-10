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

  async findAll(query: any, current: number, pageSize: number) {
    const limit = pageSize ? Number(pageSize) : 10;
    const offset = ((current ? Number(current) : 1) - 1) * limit;

    const filter: any = {};
    // Tìm kiếm theo tên nhóm quyền
    if (query.search) {
      filter.role_name = { $regex: query.search, $options: 'i' };
    }

    const [results, totalItems] = await Promise.all([
      this.roleModel.find(filter).limit(limit).skip(offset).exec(),
      this.roleModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      meta: {
        current: current ? Number(current) : 1,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      results
    };
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

  async getList(){
    return await this.roleModel.find({role_name:{$ne:'user'}}).select('_id role_name permissions').exec();
  }
}