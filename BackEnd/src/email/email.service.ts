import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as brevo from '@getbrevo/brevo'; // Import Brevo

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private apiInstance: brevo.TransactionalEmailsApi;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');

    if (!apiKey) {
      this.logger.error('BREVO_API_KEY is not configured!');
    } else {
      // Initialize Brevo
      this.apiInstance = new brevo.TransactionalEmailsApi();
      this.apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
      this.logger.log('Brevo email service initialized');
    }
  }

  // Helper to get sender object
  private getSender() {
    return {
      name: this.configService.get<string>('BREVO_SENDER_NAME') || 'AinSongjog',
      email: this.configService.get<string>('BREVO_SENDER_EMAIL'), // Must be verified in Brevo
    };
  }

  async sendOtpEmail(to: string, otp: string): Promise<boolean> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = 'Your OTP Code - AinSongjog';
      sendSmtpEmail.htmlContent = this.getOtpTemplate(otp);
      sendSmtpEmail.sender = this.getSender();
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.textContent = `Your OTP code is: ${otp}. This code expires in 5 minutes.`;

      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      
      this.logger.log(`✅ OTP email sent to ${to}, MessageID: ${response.body.messageId}`);
      return true;

    } catch (error) {
      this.logger.error(`❌ Failed to send OTP email to ${to}`, error.body || error);
      return false;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = 'Welcome to AinSongjog!';
      sendSmtpEmail.htmlContent = this.getWelcomeTemplate(name);
      sendSmtpEmail.sender = this.getSender();
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.textContent = `Welcome to AinSongjog, ${name}! We're glad to have you onboard.`;

      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      this.logger.log(`✅ Welcome email sent to ${to}, MessageID: ${response.body.messageId}`);
      return true;

    } catch (error) {
      this.logger.error(`❌ Failed to send welcome email to ${to}`, error.body || error);
      return false;
    }
  }

  async sendPasswordResetEmail(to: string, resetLink: string, name: string): Promise<boolean> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = 'Reset Your Password - AinSongjog';
      sendSmtpEmail.htmlContent = this.getPasswordResetTemplate(resetLink, name);
      sendSmtpEmail.sender = this.getSender();
      sendSmtpEmail.to = [{ email: to }];
      sendSmtpEmail.textContent = `Hello ${name}, Please click the link to reset your password: ${resetLink}`;

      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      this.logger.log(`✅ Password reset email sent to ${to}, MessageID: ${response.body.messageId}`);
      return true;

    } catch (error) {
      this.logger.error(`❌ Failed to send password reset email to ${to}`, error.body || error);
      return false;
    }
  }

  async sendTestEmail(to: string): Promise<{ success: boolean; message: string }> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = 'Test Email from AinSongjog Backend (Brevo)';
      sendSmtpEmail.htmlContent = '<h1>Test Successful!</h1><p>Your Brevo integration is working.</p>';
      sendSmtpEmail.sender = this.getSender();
      sendSmtpEmail.to = [{ email: to }];

      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      return { 
        success: true, 
        message: `Email sent successfully! MessageID: ${response.body.messageId}` 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Brevo Error: ${JSON.stringify(error.body || error.message)}` 
      };
    }
  }

  // --- EXISTING TEMPLATES BELOW (NO CHANGES NEEDED) ---

  private getOtpTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .otp-code { 
              font-size: 32px; 
              font-weight: bold; 
              color: #4f46e5; 
              text-align: center;
              margin: 20px 0;
              letter-spacing: 5px;
            }
            .footer { 
              padding: 20px; 
              text-align: center; 
              color: #6b7280; 
              font-size: 12px; 
              border-top: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>AinSongjog</h1>
              <p>OTP Verification</p>
            </div>
            <div class="content">
              <h2>Your Verification Code</h2>
              <p>Use the following OTP code to complete your verification:</p>
              <div class="otp-code">${otp}</div>
              <p>This code will expire in <strong>5 minutes</strong>.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} AinSongjog. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getWelcomeTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4f46e5;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to AinSongjog!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Welcome to AinSongjog! We're excited to have you onboard.</p>
              <p><a href="${process.env.FRONTEND_URL || 'https://your-frontend.com'}" class="button">Go to Dashboard</a></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} AinSongjog. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPasswordResetTemplate(resetLink: string, name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4f46e5;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>AinSongjog</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Click the button below to reset your password:</p>
              <p><a href="${resetLink}" class="button">Reset Password</a></p>
              <p style="word-break: break-all; color: #4f46e5;">${resetLink}</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} AinSongjog. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}