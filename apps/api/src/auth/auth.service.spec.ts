import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@aprendaufu/database';
import { AuthService } from './auth.service';

jest.mock('@aprendaufu/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(new JwtService({ secret: 'test-secret' }));
    jest.clearAllMocks();
  });

  describe('me', () => {
    it('retorna o SessionUser sem passwordHash quando o usuário existe', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        username: 'aluno',
        email: 'aluno@ufu.br',
        passwordHash: 'hash-secreto',
      });

      await expect(service.me('user-1')).resolves.toEqual({
        id: 'user-1',
        username: 'aluno',
        email: 'aluno@ufu.br',
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('lança UnauthorizedException quando o usuário do token não existe mais', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.me('user-removido')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
