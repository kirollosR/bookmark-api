import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) {}

    async register(authDto: AuthDto) {
        // Hash the password using argon2
        const hashedPassword = await argon.hash(authDto.password);

        type SafeUser = Omit<User, 'password'>;
        let user: SafeUser;
        try {
            user = await this.prisma.user.create({
                data: {
                    email: authDto.email,
                    password: hashedPassword, // Store the hashed password in the database
                },
                omit: {
                    password: true, // Omit the password field from the returned user object
                },
            });

            // return {
            //     message: 'User registered successfully!',
            //     user: user,
            // };
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException('Credentials taken'); // Handle unique constraint violation
                }
            }
            throw error; // Rethrow the error if it's not a unique constraint violation
        }
        return { user };
    }

    login(): { message: string } {
        return { message: 'User logged in successfully!' };
    }
}
