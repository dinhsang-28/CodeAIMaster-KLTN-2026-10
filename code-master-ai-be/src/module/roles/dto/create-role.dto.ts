import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString({ message: 'Tên nhóm quyền phải là một chuỗi văn bản.' })
  @IsNotEmpty({ message: 'Vui lòng nhập tên nhóm quyền (role_name)!' })
  role_name?: string;

  @IsString({ message: 'Mô tả phải là một chuỗi văn bản.' })
  @IsOptional()
  description?: string;

  @IsArray({ message: 'Danh sách quyền (permissions) phải là một mảng.' })
  @IsString({ each: true, message: 'Mỗi quyền trong mảng phải là một chuỗi văn bản.' })
  @IsOptional()
  permissions?: string[];
}
