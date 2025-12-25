import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { User } from '../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRole } from '../common/enums/role.enum';
import { AccountStatus } from '../common/enums/account-status.enum';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepo = app.get(getRepositoryToken(User));

  const adminEmail = 'ahbabzami3@gmail.com';
  const exists = await userRepo.findOne({ where: { email: adminEmail } });

  if (!exists) {
    const password = await bcrypt.hash('admin123', 10);
    await userRepo.save({
      firstName: 'Ahbab',
      lastName: 'Sakalan',
      email: adminEmail,
      password,
      dob: '2000-01-31',
      role: UserRole.ADMIN,
      status: AccountStatus.ACTIVE,
    });
    console.log('Super Admin Created');
  } else {
    console.log('Admin already exists');
  }

  await app.close();
}
bootstrap();