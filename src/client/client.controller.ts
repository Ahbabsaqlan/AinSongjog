import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './DTO\'S/CreateClient.dto';


@Controller('client')
export class ClientController {
    constructor(private readonly clientService:ClientService) {}
    @Get()
    getClients() {
        return this.clientService.getAllClients();
    }
    @Post()
    createClient(@Body() clientDto:CreateClientDto) {
        return this.clientService.createClient(clientDto);
        
    }
    @Get(':id')
    getClientById(@Param('id') id:number) {
        const numid = Number(id);
        return this.clientService.getClientById(numid);
    }
    @Put(':id')
    updateClient(@Param('id') id:number, @Body() clientDto:CreateClientDto) {
        const numid = Number(id);
        return this.clientService.updateClient(numid, clientDto);
    }
    @Patch(':id')
    patchClient(@Param('id') id:number,  @Body() clientDto:Partial<CreateClientDto>) {
        const numid = Number(id);
        return this.clientService.patchClient(numid, clientDto);   
    }
    @Delete(':id')
    deleteClient(@Param('id') id:number) {
        const numid = Number(id);
        return this.clientService.deleteClient(numid);
    }
    @Post(':id/book-consultation')
    bookConsultation(@Param('id') id: number, @Body() data: {date: string;}) {
        const numid = Number(id);
      return this.clientService.bookConsultation(numid, data);
    }
}
