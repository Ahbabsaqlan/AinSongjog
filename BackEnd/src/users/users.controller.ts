import { Controller, Get, Patch, Body, UseGuards, Request, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateLawyerProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. Public Search (Clients searching for lawyers)
  @Get('lawyers/search')
  searchActiveLawyers(@Query('query') query: string) {
    return this.usersService.searchActiveLawyers(query);
  }

  // 2. Lawyer Updates Profile (Protected)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LAWYER)
  @Patch('lawyer/profile')
  updateProfile(@Request() req, @Body() dto: UpdateLawyerProfileDto) {
    return this.usersService.updateLawyerProfile(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @Patch('client/profile')
  updateClientProfile(@Request() req, @Body() dto: UpdateClientProfileDto) {
    return this.usersService.updateClientProfile(req.user.userId, dto);
  }
}