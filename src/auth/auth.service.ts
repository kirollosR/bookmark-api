import { ConflictException, ForbiddenException, HttpCode, HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { User } from '@prisma/client';
import { console } from 'inspector';
import { ErrorResponseDto, SuccessResponseDto } from 'src/common/dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) { }

  async checkUserExists(email: string): Promise<User | null> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      throw new ConflictException(
        new ErrorResponseDto(
          'USER_EXISTS',
          'Email already registered',
          `The email ${email} is already associated with an account`,
        ),
      );
    } else {
      return null;
    }
  }

  async register(authDto: AuthDto): Promise<SuccessResponseDto<any> | ErrorResponseDto> {
    try {
      // Check if user already exists
      await this.checkUserExists(authDto.email);

      // Hash password
      const hashedPassword = await argon.hash(authDto.password);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email: authDto.email,
          password: hashedPassword,
        },
      });

      // Remove password from user object
      const { password, ...userData } = user;

      // Return formatted success response with authToken
      return new SuccessResponseDto('User registered successfully', {
        ...userData,
      });
    } catch (error: unknown) {
      // Check if it's already a handled error (like our ConflictException)
      if (error instanceof ConflictException) {
        throw error;
      }

      // For standard errors, extract the message safely
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      throw new UnprocessableEntityException(
        new ErrorResponseDto(
          'REGISTRATION_FAILED',
          'User registration failed',
          errorMessage,
        ),
      );
    }
  }

  login(): { message: string } {
    return { message: 'User logged in successfully!' };
  }

}
