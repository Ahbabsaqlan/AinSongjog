import { Controller, Get, Post, Body, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// ... import User entity logic to update status

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly service: WhatsappService) {}

  // --- ADMIN ONLY: Connect the System Bot ---
  @Get('admin/qr') 
  async getSystemQr() {
    return this.service.getSystemQr();
  }

  // --- USER: Step 1 - Request OTP ---
  @UseGuards(JwtAuthGuard)
  @Post('verify/init')
  async sendOtp(@Body() body: { mobileNumber: string }) {
    return this.service.sendVerificationOtp(body.mobileNumber);
  }

  // --- USER: Step 2 - Validate OTP ---
  @UseGuards(JwtAuthGuard)
  @Post('verify/confirm')
  async verifyOtp(@Request() req, @Body() body: { mobileNumber: string; otp: string }) {
    const isValid = await this.service.verifyOtp(body.mobileNumber, body.otp);
    if (!isValid) throw new BadRequestException("Invalid OTP");

    // TODO: Update User Entity in DB to set isPhoneVerified = true
    // this.userService.markPhoneVerified(req.user.userId);
    
    return { success: true };
  }

  // --- USER: Step 3 - Connect their OWN Account (Existing) ---
  @UseGuards(JwtAuthGuard)
  @Get('qr')
  async getUserQr(@Request() req) {
    return this.service.getQrCode(req.user.userId);
  }
}