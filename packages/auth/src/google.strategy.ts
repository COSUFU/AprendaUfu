import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

export const GOOGLE_PROVIDER = 'google';

export interface OAuthProfile {
  provider: string;
  providerId: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  avatarUrl: string | null;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, GOOGLE_PROVIDER) {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(null, false);
      return;
    }

    const oauthProfile: OAuthProfile = {
      provider: GOOGLE_PROVIDER,
      providerId: profile.id,
      email,
      emailVerified: profile._json.email_verified === true,
      displayName: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };

    done(null, oauthProfile);
  }
}
