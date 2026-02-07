import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findPermissions() {
    return this.prisma.permission.findMany({ orderBy: { code: 'asc' } });
  }

  async getRolePermissions(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: { rolePermissions: { include: { permission: true } } },
    });
    return role?.rolePermissions.map((rp) => rp.permission) ?? [];
  }
}
