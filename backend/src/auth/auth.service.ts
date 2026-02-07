import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthResult {
  accessToken: string;
  user: { id: string; email: string; name: string | null; roleId: string };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.status !== 'ACTIVE') return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');
    await this.usersService.updateLastLogin(user.id);
    return this.buildResult(user);
  }

  async register(email: string, password: string, name?: string): Promise<AuthResult> {
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({ email, passwordHash: hashed, name });
    return this.buildResult(user);
  }

  async getProfile(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }

  private buildResult(user: User): AuthResult {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
      },
    };
  }
}
