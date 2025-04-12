import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { SuccessResponseDto } from 'src/common/dto';

@UseGuards(JwtGuard)
// @UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
    @Get('me')
    getMe(@GetUser() user: User) {
        return new SuccessResponseDto('User retrieved successfully', user);
    }
}
