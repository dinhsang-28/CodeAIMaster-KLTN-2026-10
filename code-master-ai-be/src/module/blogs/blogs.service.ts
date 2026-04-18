import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './entities/blog.entity';
import { ApiResponse } from '@/common/dto/api-response.dto';
import { Model } from 'mongoose';

@Injectable()
export class BlogsService {
  uploadService: any;
  constructor(
    @InjectModel(Blog.name)
    private readonly blogsModel: Model<BlogDocument>,
  ) {}

  async create(createBlogDto: CreateBlogDto,file:Express.Multer.File): Promise<ApiResponse<Blog>> {
    let coverImageUrl = createBlogDto.cover_image || '';
    if (file) {
      const uploadResult = await this.uploadService.uploadFile(file);
      coverImageUrl = uploadResult.secure_url;
    }
    const newBlog = await this.blogsModel.create({ ...createBlogDto, cover_image: coverImageUrl });

    return new ApiResponse('Tạo bài viết thành công', newBlog.toObject());
  }

  async findAll(): Promise<ApiResponse<Blog[]>> {
    const blogs = await this.blogsModel.find().lean().exec();

    return new ApiResponse('Danh sách blog', blogs);
  }

  async findOne(id: string): Promise<ApiResponse<Blog>> {
    const category = await this.blogsModel.findById(id).lean().exec();

    if (!category) {
      throw new NotFoundException('Không tìm thấy blog');
    }

    return new ApiResponse('Lấy thể loại thành công', category);
  }

  async update(
    id: string,
    updateBlogDto: UpdateBlogDto,
    file?: Express.Multer.File
  ): Promise<ApiResponse<Blog>> {
    if (file) {
      const uploadResult = await this.uploadService.uploadFile(file);
      updateBlogDto.cover_image = uploadResult.secure_url;
    }
    const updated = await this.blogsModel.findByIdAndUpdate(id, updateBlogDto, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new NotFoundException('Không tìm thấy blog');
    }

    return new ApiResponse('Cập nhật thành công', updated.toObject());
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const deleted = await this.blogsModel.findByIdAndDelete(id);

    if (!deleted) {
      throw new NotFoundException('Không tìm thấy blog');
    }

    return new ApiResponse('Xóa thành công', null);
  }
}
