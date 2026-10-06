import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { LoggerModule } from 'nestjs-pino';
import { IncomingMessage, ServerResponse } from 'http';
import { randomUUID } from 'crypto';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

const THROTTLE_TTL_MS = 60_000;
const THROTTLE_LIMIT = 100;
const HTTP_CLIENT_ERROR = 400;
const REQUEST_ID_HEADER = 'x-request-id';

function buildThrottlerOptions(): ThrottlerModuleOptions {
  const throttlers = [{ ttl: THROTTLE_TTL_MS, limit: THROTTLE_LIMIT }];
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    return { throttlers, storage: new ThrottlerStorageRedisService(redisUrl) };
  }
  return { throttlers };
}

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        genReqId: (req: IncomingMessage, res: ServerResponse) => {
          const incoming = req.headers[REQUEST_ID_HEADER];
          const id = (typeof incoming === 'string' && incoming) || randomUUID();
          res.setHeader(REQUEST_ID_HEADER, id);
          return id;
        },
        autoLogging: {
          ignore: (req: IncomingMessage) => req.url === '/health',
        },
        customLogLevel: (
          _req: IncomingMessage,
          res: ServerResponse,
          err?: Error,
        ) => {
          if (err || res.statusCode >= HTTP_CLIENT_ERROR) {
            return 'silent';
          }
          return 'info';
        },
        serializers: {
          req: (req: { id: unknown; method: string; url: string }) => ({
            id: req.id,
            method: req.method,
            url: req.url,
          }),
          res: (res: { statusCode: number }) => ({
            statusCode: res.statusCode,
          }),
        },
      },
    }),
    ThrottlerModule.forRootAsync({ useFactory: buildThrottlerOptions }),
    AuthModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
