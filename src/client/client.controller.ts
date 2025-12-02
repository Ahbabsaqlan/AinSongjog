import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UploadedFile, UseInterceptors, UsePipes, ValidationPipe, UseGuards, Request } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dtos/createClient.dto';
import { LoginDto } from './dtos/login.dto';
import { CreateCaseDto } from './dtos/createCase.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, MulterError } from 'multer';
import { AuthGuard } from './auth/auth.guard';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  // --- Public Routes (No Guard) ---

  @Post('register')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf|jpg|png)$/)) { // Allow images too
          return cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'invalid file'), false);
        }
        return cb(null, true);
      },
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          return cb(null, Date.now() + '-' + file.originalname);
        },
      }),
    }))
  createClient(@Body() clientDto: CreateClientDto, @UploadedFile() myfile: Express.Multer.File) {
    if (myfile) clientDto.file = myfile.filename;
    return this.clientService.createClient(clientDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.clientService.login(loginDto);
  }

  // --- Protected Routes (Need JWT) ---
  
  @UseGuards(AuthGuard) 
  @Get('profile')
  getProfile(@Request() req) {
    return req.user; // Returns the user data from token
  }

  @UseGuards(AuthGuard)
  @Get()
  getAllClients() {
    return this.clientService.getAllClients();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  getClientById(@Param('id') id: number) {
    return this.clientService.getClientById(id);
  }

  // Route to create a Case for a client (One-to-Many)
  @UseGuards(AuthGuard)
  @Post(':id/case') 
  createCase(@Param('id') id: number, @Body() caseDto: CreateCaseDto) {
      return this.clientService.createCase(id, caseDto);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  updateClient(@Param('id') id: number, @Body() clientDto: CreateClientDto) {
    return this.clientService.updateClient(id, clientDto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  patchClient(@Param('id') id: number, @Body() clientDto: Partial<CreateClientDto>) {
    return this.clientService.patchClient(id, clientDto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/phone')
  updatePhone(@Param('id') id: number, @Body('phone') phone: string) {
    return this.clientService.updatePhone(id, phone);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  deleteClient(@Param('id') id: number) {
    return this.clientService.deleteClient(id);
  }
}