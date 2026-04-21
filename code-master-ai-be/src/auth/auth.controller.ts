import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  changePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from './dto/create-auth.dto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public, ResponseMessage } from '@/decorator/customize';
import { GoogleAuthGuard } from './passport/google-auth.guard';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { GithubAuthGuard } from './passport/github-auth.guard';
import { UsersService } from '@/module/users/users.service';

@Controller('auth')
export class AuthController {
  usersService: any;
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Fetch login')
  handleLogin(@Request() req, @Res() res: Response) {
    return this.authService.login(req.user, res);
  }
  @Post('refresh')
  @Public()
  async refresh(@Req() req, @Res() res: Response) {
    return this.authService.refreshToken(req, res);
  }

  @Post('register')
  @Public()
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }
  // dang xuat
  @Post('logout')
  // @UseGuards(JwtAuthGuard) // nguoi dung dang nhap roi moi logout
  logout(@Req() req, @Res() res) {
    return this.authService.logout(req, res);
  }

  @Post('check-code')
  @Public()
  checkCode(@Body() registerDto: CodeAuthDto) {
    return this.authService.checkCode(registerDto);
  }

  @Post('retry-active')
  @Public()
  retryActive(@Body('email') email: string) {
    return this.authService.retryActive(email);
  }

  @Post('retry-password')
  @Public()
  retryPassword(@Body('email') email: string) {
    return this.authService.retryPassword(email);
  }

  @Post('verify-forgot-otp')
   @Public()
  verifyForgotOTP(@Body() data: { email: string; code: string }) {
    return this.authService.verifyForgotOTP(data);
  }

  @Post('change-password')
  @Public()
  changePassword(@Body() data: changePasswordAuthDto) {
    return this.authService.changePassword(data);
  }

  //login google
  @Get('google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Request() req) {}

  @Get('google/callback')
  // @Public()
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Request() req, @Res() res) {
    return this.authService.validateOAuthLogin(req.user, res);
  }
  //login github
  @Get('github')
  @Public()
  @UseGuards(GithubAuthGuard)
  async githubAuth(@Request() req) {}

  @Get('github/callback')
  @Public()
  @UseGuards(GithubAuthGuard)
  async githubAuthRedirect(@Req() req, @Res() res) {
    // const user = await this.userService.createGithubUser(req.user);
    return this.authService.validateOAuthLogin(req.user, res);
  }
}
