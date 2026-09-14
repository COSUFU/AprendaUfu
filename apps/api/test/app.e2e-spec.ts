process.env.GOOGLE_CLIENT_ID ||= 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET ||= 'test-client-secret';
process.env.GOOGLE_CALLBACK_URL ||=
  'http://localhost:3001/auth/google/callback';
process.env.JWT_SECRET ||= 'test-jwt-secret';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET) responde no contrato do terminus', async () => {
    const response = (await request(app.getHttpServer()).get('/health')) as {
      status: number;
      body: { status?: string; details?: Record<string, unknown> };
    };

    expect([200, 503]).toContain(response.status);
    expect(['ok', 'error']).toContain(response.body.status);
    expect(response.body.details).toHaveProperty('database');
  });

  afterEach(async () => {
    await app.close();
  });
});
