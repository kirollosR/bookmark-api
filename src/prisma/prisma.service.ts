import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor(config: ConfigService) {
        super({
            datasources: {
                db: {
                    // url: process.env.DATABASE_URL, // Use environment variable
                    url: config.get('DATABASE_URL'), // Use ConfigService to get environment variable
                },
            },
        });
    }
}
