import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { PermissionsGuard } from '@/auth/passport/permissions.guard';
import { RequirePermissions } from '@/auth/decorators/permisions.decorator';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}
  @UseGuards(JwtAuthGuard,PermissionsGuard)
  @RequirePermissions('articles_create')
  @Post()
  @UseInterceptors(FileInterceptor('cover_image'))
  create(@Body() createBlogDto: CreateBlogDto,@UploadedFile() file: Express.Multer.File) {
    return this.blogsService.create(createBlogDto, file);
  }

  @Get()
  findAll() {
    return this.blogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.blogsService.findOne(id);
  }
  @UseGuards(JwtAuthGuard,PermissionsGuard)
  @RequirePermissions('articles_edit')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('cover_image'))
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.blogsService.update(id, updateBlogDto, file);
  }
  @UseGuards(JwtAuthGuard,PermissionsGuard)
  @RequirePermissions('articles_delete')
  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.blogsService.remove(id);
  }
}
