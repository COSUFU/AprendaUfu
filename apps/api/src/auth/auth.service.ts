import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma, User } from '@aprendaufu/database';
import { comparePassword, hashPassword, OAuthProfile } from '@aprendaufu/auth';
import type { AuthResponse } from '@aprendaufu/shared-types';

const PRISMA_UNIQUE_VIOLATION = 'P2002';
const MAX_OAUTH_RESOLVE_ATTEMPTS = 3;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === PRISMA_UNIQUE_VIOLATION
  );
}

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

  async validateOAuthLogin(profile: OAuthProfile): Promise<AuthResponse> {
    if (!profile.emailVerified) {
      throw new UnauthorizedException('E-mail nao verificado pelo provedor');
    }

    for (let attempt = 1; attempt <= MAX_OAUTH_RESOLVE_ATTEMPTS; attempt++) {
      try {
        return await this.resolveOAuthUser(profile);
      } catch (error) {
        if (isUniqueViolation(error) && attempt < MAX_OAUTH_RESOLVE_ATTEMPTS) {
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException(
      'Nao foi possivel concluir o login com o provedor',
    );
  }

  private async resolveOAuthUser(profile: OAuthProfile): Promise<AuthResponse> {
    const existingAccount = await prisma.authAccount.findUnique({
      where: {
        provider_providerId: {
          provider: profile.provider,
          providerId: profile.providerId,
        },
      },
      include: { user: true },
    });
    if (existingAccount) {
      return this.buildResponse(existingAccount.user);
    }

    const userWithSameEmail = await prisma.user.findUnique({
      where: { email: profile.email },
    });
    if (userWithSameEmail) {
      await prisma.authAccount.create({
        data: {
          userId: userWithSameEmail.id,
          provider: profile.provider,
          providerId: profile.providerId,
        },
      });
      return this.buildResponse(userWithSameEmail);
    }

    const username = await this.generateUsername(profile.email);
    const user = await prisma.user.create({
      data: {
        username,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        authAccounts: {
          create: {
            provider: profile.provider,
            providerId: profile.providerId,
          },
        },
      },
    });
    return this.buildResponse(user);
  }

  private async generateUsername(email: string): Promise<string> {
    const base = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');
    let candidate = base;
    while (await prisma.user.findUnique({ where: { username: candidate } })) {
      candidate = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
    }
    return candidate;
  }

  private buildResponse(user: User): AuthResponse {
    const accessToken = this.jwt.sign({ sub: user.id, role: user.role });
    return {
      accessToken,
      user: { id: user.id, username: user.username, email: user.email },
    };
  }
}
