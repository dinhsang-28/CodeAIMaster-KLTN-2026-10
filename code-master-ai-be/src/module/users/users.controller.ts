import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, UseGuards,Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '@/decorator/customize';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { PermissionsGuard } from '@/auth/passport/permissions.guard';
import { RequirePermissions } from '@/auth/decorators/permisions.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('users_create')
  @Post()
  @UseInterceptors(FileInterceptor('image'),)
  create(@Body() createUserDto: CreateUserDto,@UploadedFile() file: Express.Multer.File) {
    return this.usersService.create(createUserDto,file);
  }
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('users_view')
  @Get()
  async findAll(
    @Query() query: any, 
    @Query("current") current: string,
    @Query("pageSize") pageSize: string
  ) {
    return this.usersService.findAll(query, +current, +pageSize);
  }
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('users_view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id); 
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('users_edit')
  @Patch()
  @UseInterceptors(FileInterceptor('image'))
  update(@Body() updateUserDto: UpdateUserDto,@UploadedFile() file: Express.Multer.File) {
    return this.usersService.update(updateUserDto,file);
  }
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('users_delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
  // CẬP NHẬT HỒ SƠ CÁ NHÂN (DÀNH CHO USER ĐANG ĐĂNG NHẬP)
  @UseGuards(JwtAuthGuard) // Ai đăng nhập cũng xài được
  @Patch('profile/me')
  @UseInterceptors(FileInterceptor('image'))
  updateProfile(
    @Request() req: any,
    @Body() updateProfileDto: any, 
    @UploadedFile() file: Express.Multer.File
  ) {
    // req.user._id chính là ID của người đang request
    return this.usersService.updateMyProfile(req.user._id, updateProfileDto, file);
  }
}