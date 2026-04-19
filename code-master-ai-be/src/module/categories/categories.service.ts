import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './entities/category.entity';
import { ApiResponse } from '@/common/dto/api-response.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoriesModel: Model<CategoryDocument>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<ApiResponse<Category>> {
    const existing = await this.categoriesModel
      // .findOne({ categoryName: createCategoryDto.category_name })
      .findOne({ category_name: createCategoryDto.category_name })
      .lean();

    if (existing) {
      throw new BadRequestException('Category đã tồn tại');
    }

    const newCategory = await this.categoriesModel.create(createCategoryDto);

    return new ApiResponse('Tạo thể loại thành công', newCategory.toObject());
  }

  async findAll(query: any, current: number, pageSize: number) {
    // const { filter, sort } = aqp(query);
    const { default: aqp } = await import('api-query-params');
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    // Tối ưu hiệu suất bằng countDocuments
    const totalItems = await this.categoriesModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (+current - 1) * +pageSize;

    const results = await this.categoriesModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .sort(sort as any);

    return { results, totalPages };
  }
  // async findAll(): Promise<ApiResponse<Category[]>> {
  //   const categories = await this.categoriesModel.find().lean().exec();

  //   return new ApiResponse('Danh sách thể loại', categories);
  // }

  async findOne(id: string): Promise<ApiResponse<Category>> {
    const category = await this.categoriesModel.findById(id).lean().exec();

    if (!category) {
      throw new NotFoundException('Không tìm thấy category');
    }

    return new ApiResponse('Lấy thể loại thành công', category);
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<ApiResponse<Category>> {
    const updated = await this.categoriesModel.findByIdAndUpdate(
      id,
      updateCategoryDto,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updated) {
      throw new NotFoundException('Không tìm thấy category');
    }

    return new ApiResponse('Cập nhật thành công', updated.toObject());
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const deleted = await this.categoriesModel.findByIdAndDelete(id);

    if (!deleted) {
      throw new NotFoundException('Không tìm thấy category');
    }

    return new ApiResponse('Xóa thành công', null);
  }
}
