import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { generateVerificationCode, hashPasswordHelper } from '@/helpers/util';
import { CodeAuthDto, CreateAuthDto, changePasswordAuthDto } from '@/auth/dto/create-auth.dto';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import aqp from 'api-query-params'; 
import * as crypto from 'crypto'; 
import { Role } from '../roles/entities/role.entity';
import { UploadService } from '@/upload/upload.service';

@Injectable()
export class UsersService {
  // roleModel: any;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private readonly mailerService: MailerService,
    private readonly uploadService:UploadService
  ) {}

  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) return true;
    return false;
  }

  async create(createUserDto: CreateUserDto,file?: Express.Multer.File) {
    const { name, email, password, phone, address, image ,role_id } = createUserDto;
    
    // check Email
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(`Email đã tồn tại: ${email}, vui lòng sử dụng email khác`);
    }
    let imageUrl = createUserDto.image;
    if(file){
      const uploadResult = await this.uploadService.uploadFile(file);
      imageUrl = uploadResult.secure_url;
    }
    // hash password
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name, email, password: hashPassword, phone, address, image:imageUrl,
      role_id: role_id ? new mongoose.Types.ObjectId(role_id) : undefined,
      isActive: true
    });
    console.log("image:",user.image)
    return { _id: user._id ,image:user.image};
  }

  // async findAll(query: any, current: number, pageSize: number) {
  //   // const { filter, sort } = aqp(query);
  //   const { default: aqp } = await import('api-query-params');
  //   const options = { ...query };
  //   delete options.current;
  //   delete options.pageSize;

  //   const { filter, sort } = aqp(options);
    
  //   if (!current) current = 1;
  //   if (!pageSize) pageSize = 10;
    
  //   // Tối ưu hiệu suất bằng countDocuments
  //   const totalItems = await this.userModel.countDocuments(filter);
  //   const totalPages = Math.ceil(totalItems / pageSize);
  //   const skip = (+current - 1) * (+pageSize);
    
  //   const results = await this.userModel
  //     .find(filter)
  //     .limit(pageSize)
  //     .skip(skip)
  //     .populate('role_id')
  //     .select("-password")
  //     .sort(sort as any);
      
  //   return { results, totalPages };
  // }
  async findAll(query: any, current: number, pageSize: number) {

    // 1. Tạm thời bỏ qua aqp để test
    const limit = pageSize? Number(pageSize):10 ;
    const offset = ((current ?Number(current):1) - 1) * limit;

    
    // Nếu không có trường deleted, hãy để là {}
    const filter:any = {}; 
    if(query.search){
      filter.$or = [
        {name: { $regex: query.search, $options: 'i' }},
        {email: { $regex: query.search, $options: 'i' }}
      ]
    }

    const [results, totalItems] = await Promise.all([
      this.userModel
        .find(filter)
        .limit(limit)
        .skip(offset)
        .populate('role_id','role_name')
        .select("-password ")
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return { 
      meta: {
        current: current || 1,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      results 
    };
}

  async findOne(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException("ID không đúng định dạng MongoDB");
    }
    return await this.userModel.findById(id).populate('role_id').select("-password");
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async update(updateUserDto: UpdateUserDto, file: Express.Multer.File) {
    const { _id, name, email, phone, address, image, role_id } = updateUserDto;
    
    let imageUrl = image;
    if(file){
      const uploadResult = await this.uploadService.uploadFile(file);
      imageUrl = uploadResult.secure_url;
    }
    const finalUpdateData = {
      ...updateUserDto,
      image: imageUrl, 
    };

    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      finalUpdateData
    );
  }

  remove(_id: string) {
    if (mongoose.isValidObjectId(_id)) {
      return this.userModel.deleteOne({ _id });
    } else {
      throw new BadRequestException("Id không đúng định dạng MongoDB");
    }   
  }
  // ho so nguoi dung
  async updateMyProfile(userId: string, data: any, file?: Express.Multer.File) {
    const { name, phone, address, password } = data; // Tuyệt đối không lấy 'email' và 'role_id' từ data

    // Xử lý ảnh
    let imageUrl = data.image;
    if (file) {
      const uploadResult = await this.uploadService.uploadFile(file);
      imageUrl = uploadResult.secure_url;
    }

    const finalUpdateData: any = {};
    if (name) finalUpdateData.name = name;
    if (phone) finalUpdateData.phone = phone;
    if (address) finalUpdateData.address = address;
    if (imageUrl) finalUpdateData.image = imageUrl;

    // Nếu có nhập mật khẩu mới thì băm ra
    if (password && password.trim() !== "") {
      finalUpdateData.password = await hashPasswordHelper(password);
    }

    await this.userModel.updateOne(
      { _id: userId },
      { $set: finalUpdateData }
    );

    // Trả về thông tin user mới để Frontend cập nhật Zustand
    const updatedUser = await this.userModel.findById(userId).populate('role_id').select('-password');
    return { 
      success: true, 
      message: "Cập nhật hồ sơ thành công!",
      user: updatedUser 
    };
  }
  // LUỒNG XÁC THỰC (AUTH) VÀ GỬI MAIL
  async handleRegister(registerDto: CreateAuthDto) {
    const { name, email, password } = registerDto;
    
    if (await this.isEmailExist(email)) {
      throw new BadRequestException(`Email đã tồn tại: ${email}, vui lòng sử dụng email khác`);
    }
    const hashPassword = await hashPasswordHelper(password);
    const codeId = await generateVerificationCode(5); 
    let defaultRole = await this.roleModel.findOne({ role_name: 'user' });
    if (!defaultRole) {
      defaultRole = await this.roleModel.create({
        role_name: 'user',
        description: 'Tài khoản người học mặc định',
      });
    }
    
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      isActive: false,
      role_id: defaultRole?._id,
      codeId: codeId,
      codeExpired: dayjs().add(5, 'minutes'),
    });

     this.mailerService.sendMail({
      to: user.email!, 
      subject: 'Kích hoạt tài khoản CodeMaster AI',
      template: 'register',
      context: { name: user?.name ?? user.email, activationCode: codeId },
    });
    

    return { _id: user._id, email: user.email };
  }
  // refresh token
  async updateRefreshToken(_id: string, refreshToken: string | null) {
  return await this.userModel.findByIdAndUpdate(_id, { refreshToken: refreshToken });
}

  // lay id de kiem tra refresh token
  async refreshID(id:string){
    return await this.userModel.findById(id);
  }

  async handleActive(data: CodeAuthDto) {
    const user = await this.userModel.findOne({
      _id: data._id,
      codeId: data.code,
    });

    if (!user) throw new BadRequestException("Mã xác nhận không hợp lệ hoặc tài khoản không tồn tại");
    if (dayjs().isAfter(user.codeExpired)) throw new BadRequestException("Mã xác nhận đã hết hạn");

    await this.userModel.updateOne(
      { _id: data._id },
      { isActive: true, codeId: null, codeExpired: null }
    );

    return { success: true, message: "Kích hoạt tài khoản thành công" };
  }

  async retryActive(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException("Tài khoản người dùng không tồn tại");
    if (user.isActive) throw new BadRequestException("Tài khoản này đã được kích hoạt");

    const codeId = await generateVerificationCode(5);
    await user.updateOne({ codeId, codeExpired: dayjs().add(5, 'minutes') });

    this.mailerService.sendMail({
      to: user.email!,
      subject: 'Gửi lại mã kích hoạt CodeMaster AI',
      template: 'register',
      context: { name: user.name ?? user.email, activationCode: codeId },
    });

    return { _id: user._id };
  }

  async retryPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException("Tài khoản người dùng không tồn tại");

    const codeId = await generateVerificationCode(5);
    console.log("check code id",codeId);
    await user.updateOne({ codeId, codeExpired: dayjs().add(5, 'minutes') });

    this.mailerService.sendMail({
      to: user.email!,
      subject: 'Yêu cầu khôi phục mật khẩu CodeMaster AI',
      template: 'register',
      context: { name: user.name ?? user.email, activationCode: codeId },
    });

    return { _id: user._id, email: user.email };
  }
  // kiem tra nhap otp dung hay sai
  async verifyForgotOTP(data: { email: string; code: string }) {
    const user = await this.userModel.findOne({ 
      email: data.email, 
      codeId: data.code 
    });

    if (!user) throw new BadRequestException("Mã OTP không hợp lệ hoặc tài khoản không tồn tại");
    if (dayjs().isAfter(user.codeExpired)) throw new BadRequestException("Mã OTP đã hết hạn");

    return { success: true, message: "Mã OTP hợp lệ" };
  }

  async changePassword(data: changePasswordAuthDto) {
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException("Mật khẩu và xác nhận mật khẩu không khớp");
    }

    const user = await this.userModel.findOne({ 
      email: data.email,
      codeId: data.code 
    });

    if (!user) throw new BadRequestException("Mã xác nhận không hợp lệ hoặc tài khoản không tồn tại");
    if (dayjs().isAfter(user.codeExpired)) throw new BadRequestException("Mã xác nhận đã hết hạn");

    const newPassword = await hashPasswordHelper(data.password);
    
    await user.updateOne({ 
      password: newPassword,
      codeId: null,
      codeExpired: null
    }); 

    return { success: true, message: "Thay đổi mật khẩu thành công" };
  }
  
  //login bang google+github
  async createOAuthUser(profile: any) {
  const existingUser = await this.userModel.findOne({ email: profile.email });
  if (existingUser) {
    const isSameProvider =
      (profile.provider === 'google' && existingUser.googleId === profile.googleId) ||
      (profile.provider === 'github' && existingUser.githubId === profile.githubId);

    if (isSameProvider) return existingUser;
    throw new BadRequestException(
      `Email ${profile.email} đã được đăng ký bằng phương thức khác!`
    );
  }
  let defaultRole = await this.roleModel.findOne({ role_name: 'user' });
    if (!defaultRole) {
      defaultRole = await this.roleModel.create({
        role_name: 'user',
        description: 'Tài khoản người học mặc định',
      });
    }
  // Tạo user mới
  return await this.userModel.create({
    name: profile.name,
    email: profile.email,
    image: profile.image,
    role_id: defaultRole?._id,
    googleId: profile.provider === 'google' ? profile.googleId : undefined,
    githubId: profile.provider === 'github' ? profile.githubId : undefined,
    provider: profile.provider,
    isActive: true,
  });
}
}