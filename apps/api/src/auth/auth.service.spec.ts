import { JwtService } from '@nestjs/jwt';
import { prisma } from '@aprendaufu/database';
import { OAuthProfile } from '@aprendaufu/auth';
import { AuthService } from './auth.service';

jest.mock('@aprendaufu/database', () => ({
  prisma: {
    authAccount: { findUnique: jest.fn(), create: jest.fn() },
    user: { findUnique: jest.fn(), create: jest.fn() },
  },
}));

const authAccount = prisma.authAccount as unknown as {
  findUnique: jest.Mock;
  create: jest.Mock;
};
interface UserCreateArg {
  data: {
    username: string;
    email: string;
    avatarUrl: string | null;
    authAccounts: { create: { provider: string; providerId: string } };
  };
}
const user = prisma.user as unknown as {
  findUnique: jest.Mock;
  create: jest.Mock<Promise<unknown>, [UserCreateArg]>;
};

describe('AuthService.validateOAuthLogin', () => {
  let service: AuthService;
  const profile: OAuthProfile = {
    provider: 'google',
    providerId: 'google-123',
    email: 'ana.ribeiro@aluno.univ.br',
    emailVerified: true,
    displayName: 'Ana Ribeiro',
    avatarUrl: 'https://example.com/ana.png',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService({
      sign: jest.fn().mockReturnValue('signed-jwt'),
    } as unknown as JwtService);
  });

  it('rejeita login quando o e-mail nao foi verificado pelo provedor', async () => {
    await expect(
      service.validateOAuthLogin({ ...profile, emailVerified: false }),
    ).rejects.toThrow('E-mail nao verificado pelo provedor');

    expect(authAccount.findUnique).not.toHaveBeenCalled();
    expect(user.findUnique).not.toHaveBeenCalled();
    expect(user.create).not.toHaveBeenCalled();
    expect(authAccount.create).not.toHaveBeenCalled();
  });

  it('reusa o usuário quando já existe conta do provedor', async () => {
    authAccount.findUnique.mockResolvedValue({
      user: {
        id: 'user-1',
        username: 'ana',
        email: profile.email,
        role: 'student',
      },
    });

    const response = await service.validateOAuthLogin(profile);

    expect(response.user).toEqual({
      id: 'user-1',
      username: 'ana',
      email: profile.email,
    });
    expect(response.accessToken).toBe('signed-jwt');
    expect(user.create).not.toHaveBeenCalled();
    expect(authAccount.create).not.toHaveBeenCalled();
  });

  it('vincula ao usuário existente quando o e-mail já está cadastrado', async () => {
    authAccount.findUnique.mockResolvedValue(null);
    user.findUnique.mockResolvedValue({
      id: 'user-2',
      username: 'ana',
      email: profile.email,
      role: 'student',
    });

    const response = await service.validateOAuthLogin(profile);

    expect(authAccount.create).toHaveBeenCalledWith({
      data: { userId: 'user-2', provider: 'google', providerId: 'google-123' },
    });
    expect(user.create).not.toHaveBeenCalled();
    expect(response.user.id).toBe('user-2');
  });

  it('cria usuário e conta no primeiro login', async () => {
    authAccount.findUnique.mockResolvedValue(null);
    user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    user.create.mockResolvedValue({
      id: 'user-3',
      username: 'anaribeiro',
      email: profile.email,
      role: 'student',
    });

    const response = await service.validateOAuthLogin(profile);

    expect(user.create).toHaveBeenCalledWith({
      data: {
        username: 'anaribeiro',
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        authAccounts: {
          create: { provider: 'google', providerId: 'google-123' },
        },
      },
    });
    expect(response.user.id).toBe('user-3');
  });

  it('gera username alternativo quando o derivado já existe', async () => {
    authAccount.findUnique.mockResolvedValue(null);
    user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'other', username: 'anaribeiro' })
      .mockResolvedValueOnce(null);
    user.create.mockResolvedValue({
      id: 'user-4',
      username: 'anaribeiro1234',
      email: profile.email,
      role: 'student',
    });

    await service.validateOAuthLogin(profile);

    const createdArg = user.create.mock.calls[0][0];
    expect(createdArg.data.username).not.toBe('anaribeiro');
    expect(createdArg.data.username).toMatch(/^anaribeiro\d{4}$/);
  });
});
