import { ConflictException, ForbiddenException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) { }

  async signToken(userId: number, email: string): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Default to 1 hour if not set
      secret: process.env.JWT_SECRET,
    });

    return { access_token };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async checkUserExists(email: string): Promise<void> {
    const existingUser = await this.getUserByEmail(email);

    if (existingUser) {
      throw new ConflictException({
        code: 'USER_EXISTS',
        message: 'Email already registered',
        details: `The email ${email} is already associated with an account`,
      });
    }
  }

  async register(authDto: AuthDto): Promise<Omit<User, 'password'>> {
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

      // Remove password from user object and return
      const { password, ...userData } = user;
      return userData;
    } catch (error) {
      // Let specific errors pass through (like ConflictException)
      if (error instanceof ConflictException) {
        throw error;
      }

      // For other errors, wrap in a more descriptive exception
      throw new UnprocessableEntityException({
        code: 'REGISTRATION_FAILED',
        message: 'User registration failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  async login(authDto: AuthDto) {
    // find user by email
    const user = await this.getUserByEmail(authDto.email);

    // if user not found, throw error
    if (!user) {
      throw new ForbiddenException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        details: `No user found with email ${authDto.email}`,
      });
    }

    //compare password
    const passwordMatches = await argon.verify(user.password, authDto.password);

    // if password is incorrect, throw error
    if (!passwordMatches) {
      throw new ForbiddenException({
        code: 'INVALID_PASSWORD',
        message: 'Invalid password',
        details: 'The password provided is incorrect',
      });
    }

    return this.signToken(user.id, user.email);
  }
}
