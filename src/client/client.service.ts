import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './DTO\'S/CreateClient.dto';
import { dateTimestampProvider } from 'rxjs/internal/scheduler/dateTimestampProvider';

@Injectable()
export class ClientService {
    private clients:CreateClientDto[] = [];
    //GET 
    getAllClients() {
        return this.clients;
    }
    //POST
    createClient(clientDto:CreateClientDto) {
        
        this.clients.push(clientDto);
        return {message: 'Client created successfully', clientDto };

    }
    //GET
    getClientById(id: number) {
        const client= this.clients.find(client => client.id === id);
        return client || {message: 'Client not found'};
    }
    //PUT
    updateClient(id: number, clientDto: CreateClientDto) {
        const index = this.clients.findIndex(client => client.id === id);
        if (index === -1) {
            return {message: 'Client not found'};
        }   
        this.clients[index] = {...this.clients[index], ...clientDto};
        return {message: 'Client updated successfully', clientDto};
    }

    //PATCH
    patchClient(id: number, clientDto: Partial<CreateClientDto>) {
        const client= this.getClientById(id);
        Object.assign(client, clientDto);
        return {message: 'Client patched successfully', client};
    }

    //DELETE
    deleteClient(id: number) {
        const index = this.clients.findIndex(client => client.id === id);
        if (index === -1) {
            return {message: 'Client not found'};
        }
        this.clients.splice(index, 1);
        return {message: 'Client deleted successfully'};
    }
    //post
    bookConsultation(id: number, data: { date: string; }) {
    return { message: `Consultation booked for client ${id}`, data };
  }


}
