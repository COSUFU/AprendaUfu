import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';
import { GOOGLE_PROVIDER } from './google.strategy';
import {
  createOAuthState,
  oauthStateCookieOptions,
  OAUTH_STATE_COOKIE,
} from './oauth-state';

interface StateResponse {
  cookie(name: string, value: string, options: object): void;
}

@Injectable()
export class GoogleAuthGuard extends AuthGuard(GOOGLE_PROVIDER) {
  getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions {
    const response = context.switchToHttp().getResponse<StateResponse>();
    const state = createOAuthState();
    response.cookie(OAUTH_STATE_COOKIE, state, oauthStateCookieOptions());
    return { state };
  }
}
