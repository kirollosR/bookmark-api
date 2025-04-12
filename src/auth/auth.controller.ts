import { Body, ConflictException, Controller, HttpCode, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { ErrorResponseDto } from 'src/common/dto';

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

  // @Post('register')
  // @HttpCode(HttpStatus.CREATED)
  // async register(@Body() dto: AuthDto) {
  //     try {
  //         const { user } = await this.authService.register(dto);
  //         return {
  //             success: true,
  //             message: 'User registered successfully',
  //             data: {
  //                 user,
  //             },
  //         };
  //     } catch (error: unknown) {
  //         // Handle ConflictException
  //         if (error instanceof ConflictException) {
  //             return {
  //                 success: false,
  //                 error: {
  //                     code: 'USER_EXISTS',
  //                     message: 'Email already registered',
  //                     details: `The email ${dto.email} is already associated with an account`,
  //                 },
  //             };
  //         }

  //         // Safely extract error message
  //         const message = error instanceof Error ? error.message : 'Unknown error';
  //         return {
  //             success: false,
  //             error: {
  //                 code: 'INTERNAL_ERROR',
  //                 message: 'An unexpected error occurred',
  //                 details: message || 'Please try again later',
  //             },
  //         };
  //     }
  // }


  @Post('register')
  async register(@Body() authDto: AuthDto) {
    try {
      const result = await this.authService.register(authDto);

      if (result instanceof ErrorResponseDto) {
        // This shouldn't happen as errors are thrown as exceptions
        throw new HttpException(result, HttpStatus.BAD_REQUEST);
      }

      return result;
    } catch (error: unknown) {
      // Check if it's an HttpException
      if (error instanceof HttpException) {
        // If it already has a response structure, just rethrow it
        throw error;
      }

      // For debugging purposes
      console.error('Registration error:', error);

      // Create error response with appropriate message
      const errorMessage = error instanceof Error ? error.message : 'Please try again later';
      const errorCode = 'SERVER_ERROR';
      const errorDescription = error instanceof Error ? 'An unexpected error occurred' : 'An unknown error occurred';

      // Single throw statement for all other error types
      throw new HttpException(
        new ErrorResponseDto(errorCode, errorDescription, errorMessage),
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  @Post('login')
  login() {
    return this.authService.login();
  }
}
