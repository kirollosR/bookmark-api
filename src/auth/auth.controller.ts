import { Body, ConflictException, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // @Post('register')
    // @HttpCode(HttpStatus.CREATED)
    // register(@Body() authDto: AuthDto) {
    //     console.log({
    //         authDto,
    //     });
    //     return this.authService.register(authDto);
    // }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: AuthDto) {
        try {
            const { user } = await this.authService.register(dto);
            return {
                success: true,
                message: 'User registered successfully',
                data: {
                    user,
                },
            };
        } catch (error: unknown) {
            // Handle ConflictException
            if (error instanceof ConflictException) {
                return {
                    success: false,
                    error: {
                        code: 'USER_EXISTS',
                        message: 'Email already registered',
                        details: `The email ${dto.email} is already associated with an account`,
                    },
                };
            }

            // Safely extract error message
            const message = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An unexpected error occurred',
                    details: message || 'Please try again later',
                },
            };
        }
    }

    @Post('login')
    login() {
        return this.authService.login();
    }
}
