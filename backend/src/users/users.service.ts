import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '@prisma/client';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name?: string;
  roleId?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email }, include: { role: true } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        lastLoginAt: true,
        roleId: true,
        role: { select: { id: true, name: true } },
      },
    });
  }

  async create(data: CreateUserInput) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Un compte existe déjà avec cet email');
    const defaultRole = await this.prisma.role.findFirst({ where: { name: 'Lecteur' } });
    const roleId = data.roleId ?? defaultRole?.id;
    if (!roleId) throw new ConflictException('Aucun rôle par défaut configuré. Exécutez le seed.');
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        roleId,
      },
    });
  }

  async updateLastLogin(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async findAll(page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { items, total, page, limit };
  }
}
