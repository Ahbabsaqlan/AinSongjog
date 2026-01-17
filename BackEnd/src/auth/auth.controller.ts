import { Body, Controller, Post, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express'; // Import Express Response for cookies
import { AuthService } from './auth.service';
import { InitSignupDto, VerifyOtpDto, CompleteSignupDto } from './dto/signup.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

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

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const loginData = await this.authService.login(req.user);

    // Check NODE_ENV to decide security
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', loginData.access_token, {
      httpOnly: true,
      
      // Local = False (HTTP), Prod = True (HTTPS)
      secure: isProduction, 
      
      // 'Lax' works for both because of the Proxy!
      // The browser thinks it's talking to the "Same Site"
      sameSite: 'lax', 
      
      maxAge: 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Login successful',
      user: loginData.user,
    };
  }

  // --- ADDED LOGOUT LOGIC ---
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // Clear the cookie by setting it to expire immediately
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    
    return { message: 'Logged out successfully' };
  }
}