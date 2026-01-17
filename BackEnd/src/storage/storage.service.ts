import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      // FIX: Add || '' to ensure it is always a string
      this.configService.get('SUPABASE_URL') || '',
      this.configService.get('SUPABASE_SERVICE_ROLE') || '',
    );
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'avatars') {
    // ... rest of your code remains the same ...
    const timestamp = Date.now();
    const fileName = `${folder}/${timestamp}-${file.originalname.replace(/\s/g, '_')}`;

    const { data, error } = await this.supabase.storage
      .from('profiles')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error('Supabase Upload Error:', error);
      throw new InternalServerErrorException('Image upload failed');
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('profiles')
      .getPublicUrl(fileName);

    return { url: publicUrlData.publicUrl };
  }
}