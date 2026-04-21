import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ParseObjectIdPipe } from '@/common/pipes/parse-object-id.pipe';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';

@Controller('category')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query() query: any,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.categoriesService.findAll(query, +current, +pageSize);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.categoriesService.findOne(id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
