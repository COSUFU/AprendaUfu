import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { GoogleOAuthGuard, OAuthProfile } from '@aprendaufu/auth';
import { AuthService } from './auth.service';
import { LoginBody, RegisterBody } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterBody) {
    return this.authService.register(body.username, body.email, body.password);
  }

  @Post('login')
  login(@Body() body: LoginBody) {
    return this.authService.login(body.email, body.password);
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
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

    const auth = await this.authService.validateOAuthLogin(req.user);
    res.redirect(`${webUrl}/auth/callback#token=${auth.accessToken}`);
  }
}
