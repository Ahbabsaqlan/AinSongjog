import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InitSignupDto, VerifyOtpDto, CompleteSignupDto } from './dto/signup.dto';
import { LocalAuthGuard } from './guards/local-auth.guard'; // (Standard Passport Local Strategy Implementation required)

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup/init')
  initSignup(@Body() dto: InitSignupDto) {
    return this.authService.initSignup(dto);
  }

  @Post('signup/verify')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('signup/complete')
  completeSignup(@Body() dto: CompleteSignupDto) {
    return this.authService.completeSignup(dto);
  }

  @UseGuards(LocalAuthGuard) // Requires Passport-Local Strategy implementation
  @Post('login')
  login(@Request() req) {
    return this.authService.login(req.user);
  }
}