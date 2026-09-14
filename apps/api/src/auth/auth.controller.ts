import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { GoogleOAuthGuard, OAuthProfile } from '@aprendaufu/auth';
import { AuthService } from './auth.service';
import { LoginBody, RegisterBody } from './dto';

const CREDENTIALS_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle(CREDENTIALS_THROTTLE)
  register(@Body() body: RegisterBody) {
    return this.authService.register(body.username, body.email, body.password);
  }

  @Post('login')
  @Throttle(CREDENTIALS_THROTTLE)
  login(@Body() body: LoginBody) {
    return this.authService.login(body.email, body.password);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleCallback(
    @Req() req: { user?: OAuthProfile },
    @Res() res: Response,
  ) {
    const webUrl = process.env.WEB_URL ?? 'http://localhost:3000';
    if (!req.user) {
      res.redirect(`${webUrl}/login?error=oauth`);
      return;
    }

    try {
      const auth = await this.authService.validateOAuthLogin(req.user);
      res.redirect(`${webUrl}/auth/callback#token=${auth.accessToken}`);
    } catch (error) {
      this.logger.error(
        'Falha ao concluir login OAuth',
        error instanceof Error ? error.stack : String(error),
      );
      res.redirect(`${webUrl}/login?error=oauth`);
    }
  }
}
