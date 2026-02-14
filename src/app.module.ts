import { Module } from '@nestjs/common';
import { UserModule } from './api/user/user.module';
import { BookModule } from './api/book/book.module';
import { PrismaModule } from './config/prisma/prisma.module';
import { JwtAuthModule } from './config/jwt/jwt.module';

@Module({
  imports: [UserModule, BookModule, PrismaModule, JwtAuthModule],
})
export class AppModule {}
