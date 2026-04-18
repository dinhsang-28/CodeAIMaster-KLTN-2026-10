import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({ message: "Tên không được để trống" })
  name!: string;

  @IsNotEmpty({ message: "Email không được để trống" })
  @IsEmail({}, { message: "Email không đúng định dạng" })
  email!: string;

  @IsNotEmpty({ message: "Password không được để trống" })
  password!: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  image?: string;
  @IsOptional()
  role_id?: string;
}