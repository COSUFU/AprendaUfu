import { Body, Controller, Post } from '@nestjs/common';
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
}
