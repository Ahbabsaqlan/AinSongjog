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
  
    @Post('upload')
    @UseGuards(JwtAuthGuard) // Only logged-in users can upload
    @UseInterceptors(FileInterceptor('file')) // 'file' matches the frontend form-data key
    async uploadFile(
      @UploadedFile(
        new ParseFilePipe({
          validators: [
            new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB Limit
            new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }), // Images only
          ],
        }),
      )
      file: Express.Multer.File,
    ) {
      return this.storageService.uploadFile(file);
    }
  }