import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) { }

    register() {
        return { "message": 'User registered successfully!' };
    }

    login() {
        return { "message": 'User logged in successfully!' };
    }
}
