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

  // async findAll(query: any, current: number, pageSize: number) {
  //   // const { filter, sort } = aqp(query);
  //   const { default: aqp } = await import('api-query-params');
  //   const { filter, sort } = aqp(query);
  //   if (filter.current) delete filter.current;
  //   if (filter.pageSize) delete filter.pageSize;

  //   if (!current) current = 1;
  //   if (!pageSize) pageSize = 10;

  //   // Tối ưu hiệu suất bằng countDocuments
  //   const totalItems = await this.categoriesModel.countDocuments(filter);
  //   const totalPages = Math.ceil(totalItems / pageSize);
  //   const skip = (+current - 1) * +pageSize;

  //   const results = await this.categoriesModel
  //     .find(filter)
  //     .limit(pageSize)
  //     .skip(skip)
  //     .select('-password')
  //     .sort(sort as any);

  //   return { results, totalPages };
  // }

  async findAll(query: any, current = 1, pageSize = 10) {
    const { default: aqp } = await import('api-query-params');
    const { filter, sort } = aqp(query);

    // loại bỏ param không cần
    delete filter.current;
    delete filter.pageSize;

    current = Number(current) || 1;
    pageSize = Number(pageSize) || 10;
    const skip = (current - 1) * pageSize;

    /**
     * ✅ BUILD SORT (không lỗi TS)
     */
    const sortObj: Record<string, 1 | -1> = {};

    if (sort && typeof sort === 'object') {
      for (const [key, val] of Object.entries(sort)) {
        const value = String(val).toLowerCase();
        sortObj[key] = value === 'asc' || value === '1' ? 1 : -1;
      }
    } else {
      sortObj.createdAt = -1;
    }

    /**
     * ✅ AGGREGATE PIPELINE
     */
    const pipeline = [
      { $match: filter },

      // join course + count
      {
        $lookup: {
          from: 'courses',
          let: { categoryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    { $toString: '$category' }, // fix mismatch ObjectId vs string
                    { $toString: '$$categoryId' },
                  ],
                },
              },
            },
            {
              $count: 'count',
            },
          ],
          as: 'courseData',
        },
      },

      // add field courseCount
      {
        $addFields: {
          courseCount: {
            $ifNull: [{ $arrayElemAt: ['$courseData.count', 0] }, 0],
          },
        },
      },

      // remove field dư
      {
        $project: {
          courseData: 0,
        },
      },

      // sort
      {
        $sort: sortObj,
      },

      // pagination + total
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: pageSize }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const result = await this.categoriesModel.aggregate(pipeline);

    const data = result[0]?.data || [];
    const totalItems = result[0]?.totalCount?.[0]?.count || 0;

    return {
      results: data,
      meta: {
        current,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }
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
