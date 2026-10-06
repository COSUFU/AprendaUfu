import { randomBytes, timingSafeEqual } from 'crypto';

export const OAUTH_STATE_COOKIE = 'oauth_state';
export const OAUTH_COOKIE_PATH = '/auth';

const STATE_BYTES = 16;
const STATE_MAX_AGE_MS = 10 * 60 * 1000;

export interface OAuthStateCookieOptions {
  httpOnly: boolean;
  sameSite: 'lax';
  secure: boolean;
  signed: boolean;
  path: string;
  maxAge: number;
}

export function createOAuthState(): string {
  return randomBytes(STATE_BYTES).toString('hex');
}

export function oauthStateCookieOptions(): OAuthStateCookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    path: OAUTH_COOKIE_PATH,
    maxAge: STATE_MAX_AGE_MS,
  };
}

export function oauthStateMatches(
  expected: string | undefined,
  received: string | undefined,
): boolean {
  if (!expected || !received) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
