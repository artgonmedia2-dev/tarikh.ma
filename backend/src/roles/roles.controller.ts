import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('roles')
export class RolesController {
  constructor(private roles: RolesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list() {
    return this.roles.findAll();
  }

  @Get('permissions')
  @UseGuards(JwtAuthGuard)
  async permissions() {
    return this.roles.findPermissions();
  }

  @Get(':id/permissions')
  @UseGuards(JwtAuthGuard)
  async rolePermissions(@Param('id') id: string) {
    return this.roles.getRolePermissions(id);
  }
}
