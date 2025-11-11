import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UploadedFile, UseInterceptors, UsePipes ,ValidationPipe } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './DTO\'S/CreateClient.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, MulterError } from 'multer';


@Controller('client')
export class ClientController {
    constructor(private readonly clientService:ClientService) {}
    @Get()
    getClients() {
        return this.clientService.getAllClients();
    }
    @Post()
    @UsePipes(new ValidationPipe())
    @UseInterceptors(FileInterceptor('file',
        {
        fileFilter: (req,file , cb) => {
            if(!file.originalname.match(/\.(pdf)$/)){
                return cb(new Error('Only PDF files are allowed!'), false);
            }
            else{
                return cb(null, true);
            }
        }
    ,
     storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
            return cb(null, Date.now() + '-' + file.originalname);
        },
     }),

    }
))
    createClient(@Body()   clientDto:CreateClientDto , @UploadedFile() myfile: Express.Multer.File) {
        if (myfile) {
            clientDto={...clientDto, file: myfile.filename};
        }
        // console.log(myfile);
        //console.log(clientDto);
        return this.clientService.createClient(clientDto);
        
    }
    @Get(':id')
    getClientById(@Param('id') id:number) {
        
        return this.clientService.getClientById(id);
    }
    @Put(':id')
    updateClient(@Param('id') id:number, @Body() clientDto:CreateClientDto) {
        
        return this.clientService.updateClient(id, clientDto);
    }
    
    @Patch(':id')
    patchClient(@Param('id') id:number,  @Body() clientDto:Partial<CreateClientDto>) {
        
        return this.clientService.patchClient(id, clientDto);   
    }
    @Delete(':id')
    deleteClient(@Param('id') id:number) {
        
        return this.clientService.deleteClient(id);
    }
    @Post(':id/book-consultation')
    bookConsultation(@Param('id') id: number, @Body() data: {date: string;}) {
     
      return this.clientService.bookConsultation(id, data);
    }
}
