import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
import { PermissionsGuard } from '@/auth/passport/permissions.guard';
import { RequirePermissions } from '@/auth/decorators/permisions.decorator';
import { Public } from '@/decorator/customize';

// @UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admin/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // @RequirePermissions('roles_create')
  @Public()
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @RequirePermissions('roles_view')
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @RequirePermissions('roles_view')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @RequirePermissions('roles_edit')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @RequirePermissions('roles_delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  // API LƯU MA TRẬN PHÂN QUYỀN TỪ FRONTEND
  @RequirePermissions('roles_permissions')
  @Patch('permissions/bulk-update') 
  async updatePermissions(@Body() body: { roles: { id: string; permissions: string[] }[] }) {
    for (const item of body.roles) {
      await this.rolesService.updateRolePermissions(item.id, item.permissions);
    }
    return { message: 'Cập nhật hệ thống phân quyền thành công!' };
  }
}