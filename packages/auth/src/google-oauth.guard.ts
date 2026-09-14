import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GOOGLE_PROVIDER, OAuthProfile } from './google.strategy';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard(GOOGLE_PROVIDER) {
  handleRequest<TUser = OAuthProfile | null>(_err: unknown, user: TUser): TUser {
    return user;
  }
}
