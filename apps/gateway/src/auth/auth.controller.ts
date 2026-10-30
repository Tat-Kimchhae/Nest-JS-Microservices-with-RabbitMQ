import { Controller, Get, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './current-user.decorator.js';
import type { UserContext } from './auth.types.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  me(@CurrentUser() user: UserContext) {
    return { user };
  }
}
