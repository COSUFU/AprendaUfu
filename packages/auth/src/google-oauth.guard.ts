import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GOOGLE_PROVIDER, OAuthProfile } from './google.strategy';
import {
  OAUTH_COOKIE_PATH,
  OAUTH_STATE_COOKIE,
  oauthStateMatches,
} from './oauth-state';

interface StateRequest {
  signedCookies?: Record<string, string>;
  query?: Record<string, unknown>;
}

interface StateResponse {
  clearCookie(name: string, options: object): void;
}

@Injectable()
export class GoogleOAuthGuard extends AuthGuard(GOOGLE_PROVIDER) {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<StateRequest>();
    const response = context.switchToHttp().getResponse<StateResponse>();

    const expected = request.signedCookies?.[OAUTH_STATE_COOKIE];
    const received =
      typeof request.query?.state === 'string' ? request.query.state : undefined;

    response.clearCookie(OAUTH_STATE_COOKIE, { path: OAUTH_COOKIE_PATH });

    if (!oauthStateMatches(expected, received)) {
      return true;
    }

    return (await super.canActivate(context)) as boolean;
  }

  handleRequest<TUser = OAuthProfile | null>(_err: unknown, user: TUser): TUser {
    return user;
  }
}
