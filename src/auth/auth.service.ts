import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { AuthDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ForbiddenException } from '@nestjs/common/exceptions';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(data: AuthDto) {
    const hash = await argon.hash(data.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          hash,
        },
      });

      delete user.hash;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }

        throw error;
      }
    }
  }

  signin() {
    return { msg: 'I am sign in' };
  }
}
