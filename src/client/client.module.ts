import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entity/client.entity';
import { Case } from './entity/case.entity';
import { ClientProfile } from './entity/clientProfile.entity';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';
import { ClientController } from './client.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Client,Case,ClientProfile]),
      JwtModule.register({
      global: true,
      secret: 'SECRET_KEY',
      signOptions: { expiresIn: '60m' },
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'Arfiny007@gmail.com',
          pass: 'brsttbmhfhnmyrsf',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@ainsonjog.com>',
      },
    }),
  ],
  controllers: [ClientController],
  providers: [ClientService]
})
export class ClientModule {}
