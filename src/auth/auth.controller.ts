import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { SuccessResponseDto } from 'src/common/dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() authDto: AuthDto) {
    const userData = await this.authService.register(authDto);
    return new SuccessResponseDto('User registered successfully', userData);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() authDto: AuthDto) {
    const userData = await this.authService.login(authDto);
    return new SuccessResponseDto('User logged in successfully', userData);
  }
}
