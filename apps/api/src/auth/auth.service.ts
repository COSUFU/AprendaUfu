import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma, User } from '@aprendaufu/database';
import { comparePassword, hashPassword } from '@aprendaufu/auth';
import type { AuthResponse, SessionUser } from '@aprendaufu/shared-types';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throw new ConflictException('E-mail ou usuário já cadastrado');
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username, email, passwordHash },
    });

    return this.buildResponse(user);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (
      !user?.passwordHash ||
      !(await comparePassword(password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.buildResponse(user);
  }

  async me(userId: string): Promise<SessionUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Sessão inválida');
    }

    return { id: user.id, username: user.username, email: user.email };
  }

  private buildResponse(user: User): AuthResponse {
    const accessToken = this.jwt.sign({ sub: user.id, role: user.role });
    return {
      accessToken,
      user: { id: user.id, username: user.username, email: user.email },
    };
  }
}
