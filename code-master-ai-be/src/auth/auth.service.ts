import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/module/users/users.service';
import { comparePasswordHelper } from '@/helpers/util';
import { JwtService } from '@nestjs/jwt';
import {
  changePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from './dto/create-auth.dto';
// import { permission } from 'process';

@Injectable()
export class AuthService {
  userModel: any;
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user) return null;
    const isValidPassword = await comparePasswordHelper(pass, user.password);
    if (!isValidPassword) return null;
    return user;
  }

  async login(user: any, res: any) {
    const accessExpire = process.env.JWT_ACCESS_EXPIRE || '15m';
    const refreshExpire = process.env.JWT_REFRESH_EXPIRE || '7d';
    const accessCookieAge =
      parseInt(process.env.COOKIE_ACCESS_MAX_AGE as string, 10) || 900000;
    const refreshCookieAge =
      parseInt(process.env.COOKIE_REFRESH_MAX_AGE as string, 10) || 604800000;

    //lam quyen
    const userInfo = await this.usersService.findOne(user._id);

    const payload = {
      username: user.email,
      sub: user._id.toString(),
      permissions: userInfo?.role_id?.['permissions'] || [],
    };

    // Cấp token
    const token = this.jwtService.sign(payload, {
      expiresIn: accessExpire as any,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshExpire as any,
    });

    await this.usersService.updateRefreshToken(user._id, refreshToken);

    const isProd = process.env.NODE_ENV === 'production';
    const cookieBase = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : ('lax' as const),
    };

    res.cookie('access_token', token, {
      ...cookieBase,
      maxAge: accessCookieAge,
    });

    res.cookie('refresh_token', refreshToken, {
      ...cookieBase,
      path: '/',
      maxAge: refreshCookieAge,
    });

    return res.status(HttpStatus.OK).json({
      user: {
        email: user.email,
        _id: user._id,
        name: user.name,
        permissions: payload.permissions,
        phone: user.phone,
        image: user.image,
      },
      message: 'Đăng nhập thành công!',
    });
  }

  async refreshToken(req: any, res: any) {
    const accessExpire = process.env.JWT_ACCESS_EXPIRE || '15m';
    const accessCookieAge =
      parseInt(process.env.COOKIE_ACCESS_MAX_AGE as string, 10) || 900000;

    const isProd = process.env.NODE_ENV === 'production';
    const cookieBase = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : ('lax' as const),
    };

    const refreshToken = req.cookies['refresh_token'];

    // Hàm dọn dẹp cookie
    const clearAll = () => {
      res.clearCookie('access_token', cookieBase);
      res.clearCookie('refresh_token', { ...cookieBase, path: '/' });
    };
    if (!refreshToken) {
      clearAll();
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Không tìm thấy Refresh Token. Vui lòng login lại!' });
    }

    try {
      const decoded = this.jwtService.verify(refreshToken);

      // Kiểm tra token có khớp DB không
      const user = await this.usersService.refreshID(decoded.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException(
          'Refresh Token không hợp lệ hoặc đã bị thu hồi!',
        );
      }
      const userInfo = await this.usersService.findOne(user._id.toString());

      const payload = { 
        username: user.email, 
        sub: user._id,
        permissions: userInfo?.role_id?.['permissions'] || [], 
      };
      const newAccessToken = this.jwtService.sign(payload, {
        expiresIn: accessExpire as any,
      });

      res.cookie('access_token', newAccessToken, {
        ...cookieBase,
        maxAge: accessCookieAge,
      });

      return res
        .status(HttpStatus.OK)
        .json({ message: 'Làm mới Token thành công!' });
    } catch (error) {
      const decoded = this.jwtService.decode(refreshToken) as any;
      if (decoded?.sub) {
        await this.usersService.updateRefreshToken(
          decoded.sub.toString(),
          null,
        );
        console.log(
          `[Refresh hết hạn] Đã xóa token DB của user: ${decoded.sub}`,
        );
      }

      clearAll();
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Phiên đăng nhập hết hạn.' });
    }
  }

  async logout(req: any, res: any) {
    try {
      const isProd = process.env.NODE_ENV === 'production';
      const cookieBase = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : ('lax' as const),
      };

      const refreshToken = req.cookies['refresh_token'];

      if (refreshToken) {
        try {
          const decoded = this.jwtService.decode(refreshToken) as any;
          if (decoded && decoded.sub) {
            await this.usersService.updateRefreshToken(
              decoded.sub.toString(),
              null,
            );
            console.log(`[Logout] Đã dọn sạch DB cho user: ${decoded.sub}`);
          }
        } catch (err) {
          console.error('Lỗi khi decode logout:', err);
        }
      }

      res.clearCookie('access_token', cookieBase);
      res.clearCookie('refresh_token', {
        ...cookieBase,
        path: '/',
      });

      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        message: 'Đăng xuất thành công. Hẹn gặp lại bạn!',
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Có lỗi xảy ra khi đăng xuất',
      });
    }
  }

  handleRegister = async (registerDto: CreateAuthDto) => {
    return await this.usersService.handleRegister(registerDto);
  };

  checkCode = async (data: CodeAuthDto) => {
    return await this.usersService.handleActive(data);
  };

  retryActive = async (email: string) => {
    return await this.usersService.retryActive(email);
  };

  retryPassword = async (email: string) => {
    return await this.usersService.retryPassword(email);
  };
  verifyForgotOTP = async (data: { email: string; code: string }) => {
    return await this.usersService.verifyForgotOTP(data);
  };

  changePassword = async (data: changePasswordAuthDto) => {
    return await this.usersService.changePassword(data);
  };

  async validateOAuthLogin(profile: any, res: any) {
    const accessExpire = process.env.JWT_ACCESS_EXPIRE || '15m';
    const refreshExpire = process.env.JWT_REFRESH_EXPIRE || '7d';
    const accessCookieAge =
      parseInt(process.env.COOKIE_ACCESS_MAX_AGE as string, 10) || 900000;
    const refreshCookieAge =
      parseInt(process.env.COOKIE_REFRESH_MAX_AGE as string, 10) || 604800000;
    const isProd = process.env.NODE_ENV === 'production';

    const user = await this.usersService.createOAuthUser(profile);

    const payload = { username: user.email, sub: user._id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessExpire as any,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshExpire as any,
    });

    await this.usersService.updateRefreshToken(
      user._id.toString(),
      refreshToken,
    );

    const cookieBase = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : ('lax' as const),
    };

    res.cookie('access_token', accessToken, {
      ...cookieBase,
      maxAge: accessCookieAge,
    });

    res.cookie('refresh_token', refreshToken, {
      ...cookieBase,
      path: '/',
      maxAge: refreshCookieAge,
    });

    //  Truyền user info qua URL để frontend lấy
    const userInfo = encodeURIComponent(
      JSON.stringify({
        _id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
      }),
    );
    const frontendUrl =
      process.env.FRONTEND_URL ||
      'https://code-ai-master-kltn-2026-10.vercel.app';

    const callbackUrl =
      profile.provider === 'github'
        ? `${frontendUrl}/auth/github/callback?user=${userInfo}`
        : `${frontendUrl}/auth/google/callback?user=${userInfo}`;

    return res.redirect(callbackUrl);
  }
  async getMe(userId: string) {
    const user = await this.usersService.findOne(userId);
    console.log("GetMe user: ", user);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      email: user.email,
      _id: user._id,
      name:user.name,
      permissions: user.role_id?.['permissions'] || [],
      phone: user.phone,
      image: user.image,
    };
  }
}
