
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'defaultSecret', // Replace 'defaultSecret' with your fallback value
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
  }) {
    const user = await this.prisma.user.findUnique({
        where: {
            id: payload.sub,
        }
    });
    if (!user) {
        throw new UnauthorizedException('User not found');
    }

    const { password, ...userData } = user;
    return userData;
  }
}
