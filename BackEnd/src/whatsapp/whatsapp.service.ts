import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useSupabaseAuthState } from './supabase-auth';
import { Boom } from '@hapi/boom';
import { randomInt } from 'crypto';

// Remove top-level Baileys imports to avoid CommonJS error

@Injectable()
export class WhatsappService {
  private sessions = new Map<string, any>();
  private qrCodes = new Map<string, string>();
  private otpStore = new Map<string, string>(); // Temporary OTP storage (Use Redis/DB in Prod)
  private readonly SYSTEM_ID = 'SYSTEM_BOT'; // The ID for the Admin's WhatsApp
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL') || '',
      this.configService.get('SUPABASE_SERVICE_ROLE') || '',
      { auth: { persistSession: false } }
    );
  }

  // 1. Send OTP (Uses System Bot to message User)
  async sendVerificationOtp(phoneNumber: string) {
    const otp = randomInt(100000, 999999).toString();
    this.otpStore.set(phoneNumber, otp);

    // Ensure System Bot is connected
    let sock = this.sessions.get(this.SYSTEM_ID);
    if (!sock) {
      sock = await this.connectToWhatsapp(this.SYSTEM_ID);
      // Give it a moment to connect
      await new Promise(r => setTimeout(r, 2000));
    }

    if (!this.sessions.has(this.SYSTEM_ID)) {
      throw new Error("System WhatsApp Bot is not connected. Admin must connect it first.");
    }

    const formattedPhone = phoneNumber.replace(/\D/g, '') + '@s.whatsapp.net';
    
    try {
      await sock.sendMessage(formattedPhone, { 
        text: `Your AinShongjog Verification Code is: *${otp}*` 
      });
      return { message: "OTP Sent via WhatsApp" };
    } catch (e) {
      console.error(e);
      throw new Error("Failed to send WhatsApp message");
    }
  }

  // 2. Verify OTP
  async verifyOtp(phoneNumber: string, code: string) {
    const storedOtp = this.otpStore.get(phoneNumber);
    if (storedOtp && storedOtp === code) {
      this.otpStore.delete(phoneNumber);
      return true;
    }
    return false;
  }

  // 3. Admin Connect (Get QR for System Bot)
  async getSystemQr() {
    return this.getQrCode(this.SYSTEM_ID);
  }

  
  async getConnection(userId: string) {
    if (this.sessions.has(userId)) return this.sessions.get(userId);
    return this.connectToWhatsapp(userId);
  }

  async connectToWhatsapp(userId: string) {
    // FIX: Dynamic Import
    // Note: makeWASocket is a default export
    const { 
      default: makeWASocket, 
      DisconnectReason, 
      Browsers, 
      fetchLatestBaileysVersion 
    } = await import('@whiskeysockets/baileys');

    const { state, saveCreds } = await useSupabaseAuthState(
      this.supabase,
      'whatsapp-sessions',
      userId
    );

    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      printQRInTerminal: false,
      auth: state,
      browser: Browsers.macOS('Desktop'),
      syncFullHistory: false,
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log(`QR Generated for ${userId}`);
        this.qrCodes.set(userId, qr);
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        
        this.sessions.delete(userId);
        this.qrCodes.delete(userId);

        if (shouldReconnect) {
          this.connectToWhatsapp(userId);
        } else {
          console.log(`User ${userId} logged out.`);
        }
      } else if (connection === 'open') {
        console.log(`WhatsApp Connected: ${userId}`);
        this.sessions.set(userId, sock);
        this.qrCodes.delete(userId);
      }
    });

    sock.ev.on('creds.update', saveCreds);

    return sock;
  }

  async getQrCode(userId: string) {
    if (!this.sessions.has(userId)) {
       this.connectToWhatsapp(userId).catch(e => console.error(e));
    }
    
    let attempts = 0;
    while (!this.qrCodes.has(userId) && !this.sessions.has(userId) && attempts < 5) {
      await new Promise(r => setTimeout(r, 1000));
      attempts++;
    }
    
    return { 
      qr: this.qrCodes.get(userId), 
      isConnected: this.sessions.has(userId) 
    };
  }

  async sendWhatsAppMessage(senderId: string, recipientPhone: string, text: string) {
    try {
      let sock = this.sessions.get(senderId);
      if (!sock) {
        sock = await this.connectToWhatsapp(senderId);
        let attempts = 0;
        while (!this.sessions.has(senderId) && attempts < 10) {
            await new Promise(r => setTimeout(r, 500));
            attempts++;
        }
        sock = this.sessions.get(senderId);
      }

      if (!sock) throw new Error('Session not found or disconnected');

      const formattedPhone = recipientPhone.replace(/\D/g, '') + '@s.whatsapp.net';
      await sock.sendMessage(formattedPhone, { text });
      return true;
    } catch (error) {
      console.error('WA Send Error:', error);
      return false;
    }
  }

  isClientConnected(userId: string): boolean {
    return this.sessions.has(userId);
  }
}