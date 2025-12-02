import { Module } from '@nestjs/common';
import { ClientController } from './client/client.controller';
import { ClientModule } from './client/client.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ClientModule,TypeOrmModule.forRoot({
      type: 'postgres', 
      host: 'localhost',
      port: 5432,       
      username: 'postgres', 
      password: 'admin', 
      database: 'ainsongjogDB',
      autoLoadEntities: true,
      synchronize: true, 
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
