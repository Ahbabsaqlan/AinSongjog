import { Module } from '@nestjs/common';
import { ClientController } from './client/client.controller';
import { ClientService } from './client/client.service';
import { ClientModule } from './client/client.module';

@Module({
  imports: [ClientModule],
  controllers: [ClientController],
  providers: [ClientService],
})
export class AppModule {}
