import { 
    Controller, 
    Post, 
    UseInterceptors, 
    UploadedFile, 
    ParseFilePipe, 
    MaxFileSizeValidator, 
    FileTypeValidator, 
    UseGuards
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { StorageService } from './storage.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  
  @Controller('storage')
  export class StorageController {
    constructor(private readonly storageService: StorageService) {}
  
    // 1. AVATAR UPLOAD (Strict: Images only, Max 10MB)
    @Post('upload/avatar')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(
      @UploadedFile(
        new ParseFilePipe({
          validators: [
            new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10 MB
            new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
          ],
        }),
      )
      file: Express.Multer.File,
    ) {
      return this.storageService.uploadFile(file, 'avatars');
    }
  
    // 2. DOCUMENT UPLOAD (Flexible: Any Type, Max 50MB)
    @Post('upload/document')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadDocument(
      @UploadedFile(
        new ParseFilePipe({
          validators: [
            new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50 MB
          ],
        }),
      )
      file: Express.Multer.File,
    ) {
      return this.storageService.uploadFile(file, 'documents');
    }
  }