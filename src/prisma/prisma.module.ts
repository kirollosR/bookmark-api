import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Make this module global so it can be used in other modules without importing it
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export PrismaService to be used in other modules
})
export class PrismaModule {}
