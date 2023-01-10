import { Controller, Post } from '@nestjs/common';
import { Body, HttpCode } from '@nestjs/common/decorators';
import { HttpStatus } from '@nestjs/common/enums';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @Post('/signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }
}
