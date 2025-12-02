import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entity/client.entity';
import { Repository } from 'typeorm';
import { Case } from './entity/case.entity';
import { ClientProfile } from './entity/clientProfile.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';   
import * as bcrypt from 'bcrypt';
import { CreateClientDto } from './dtos/createClient.dto';
import { LoginDto } from './dtos/login.dto';
import { CreateCaseDto } from './dtos/createCase.dto';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ClientService {

    constructor(@InjectRepository(Client) private clientRepo: Repository<Client>,
                @InjectRepository(Case) private caseRepo: Repository<Case>,
                @InjectRepository(ClientProfile) private profileRepo: Repository<ClientProfile>,
                private mailerService: MailerService,
                private jwtService: JwtService) {}

    
  async createClient(data: CreateClientDto): Promise<any> {
    
    const existing = await this.clientRepo.findOneBy({ email: data.email });
    if (existing) throw new BadRequestException('Email already exists');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Create Profile Instance (One-to-One)
    const profile = new ClientProfile();
    profile.address = data.address || 'N/A';
    profile.nationalId = data.nationalId || 'N/A';

    
    const client = new Client();
    client.name = data.name;
    client.email = data.email;
    client.phone = data.phone;
    client.password = hashedPassword;
    client.file = data.file;
    client.profile = profile; 

    const savedClient = await this.clientRepo.save(client);


    try {
        await this.mailerService.sendMail({
        to: data.email,
        subject: 'Welcome to Ainsonjog',
        text: `Hello ${data.name}, your account has been created successfully.`,
        });
    } catch (e) {
        console.log("Email error:", e); 
    }

    return savedClient;
  }

  
  async login(loginDto: LoginDto) {
    const client = await this.clientRepo.findOne({ where: { email: loginDto.email } });
    if (!client) {
        throw new UnauthorizedException('Client not found');
    }
    const isMatch = await bcrypt.compare(loginDto.password, client.password);
    if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: client.email, id: client.id };
    return {
        access_token: this.jwtService.sign(payload),
    };
  }

  async createCase(clientId: number, caseData: CreateCaseDto) {
    const client = await this.clientRepo.findOneBy({ id: clientId });
    if(!client) throw new NotFoundException('Client not found');

    const newCase = this.caseRepo.create({
        ...caseData,
        client: client
    });
    return await this.caseRepo.save(newCase);
  }

 
  async getClientById(id: number): Promise<Client> {
    const client = await this.clientRepo.findOne({ 
        where: { id },
        relations: ['profile', 'cases'] 
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async getAllClients(): Promise<Client[]> {
    return await this.clientRepo.find({ relations: ['profile'] });
  }

  async updateClient(id: number, data: Partial<CreateClientDto>): Promise<Client> {
    await this.clientRepo.update(id, { name: data.name, phone: data.phone });
    return this.getClientById(id);
  }

  async patchClient(id: number, data: Partial<CreateClientDto>): Promise<Client> {
    return this.updateClient(id, data);
  }

  async updatePhone(id: number, phone: string): Promise<Client> {
    await this.clientRepo.update(id, { phone });
    return this.getClientById(id);
  }

  async deleteClient(id: number): Promise<{ message: string }> {
    await this.clientRepo.delete(id);
    return { message: 'Client deleted successfully' };
  }

    
}
