import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.users.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
