import { HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus';
import { prisma } from '@aprendaufu/database';
import { HealthController } from './health.controller';

jest.mock('@aprendaufu/database', () => ({
  prisma: { $queryRaw: jest.fn() },
}));

const queryRaw = (prisma as unknown as { $queryRaw: jest.Mock }).$queryRaw;

interface WithDatabaseCheck {
  checkDatabase(): Promise<HealthIndicatorResult>;
}

describe('HealthController.checkDatabase', () => {
  let controller: HealthController;
  let up: jest.Mock;
  let down: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    up = jest.fn().mockReturnValue({ database: { status: 'up' } });
    down = jest.fn().mockReturnValue({ database: { status: 'down' } });
    const indicator = { check: jest.fn().mockReturnValue({ up, down }) };
    controller = new HealthController({} as HealthCheckService, indicator);
  });

  it('reporta "up" quando o banco responde', async () => {
    queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const result = await (
      controller as unknown as WithDatabaseCheck
    ).checkDatabase();

    expect(up).toHaveBeenCalled();
    expect(down).not.toHaveBeenCalled();
    expect(result).toEqual({ database: { status: 'up' } });
  });

  it('reporta "down" quando o banco está inacessível', async () => {
    queryRaw.mockRejectedValue(new Error('connection refused'));

    const result = await (
      controller as unknown as WithDatabaseCheck
    ).checkDatabase();

    expect(down).toHaveBeenCalled();
    expect(up).not.toHaveBeenCalled();
    expect(result).toEqual({ database: { status: 'down' } });
  });
});
