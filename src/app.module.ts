import { Module } from '@nestjs/common';
import { UserModule } from './api/user/user.module';
import { BookModule } from './api/book/book.module';
import { PrismaModule } from './config/prisma/prisma.module';
import { JwtAuthModule } from './config/jwt/jwt.module';
import { DocumentModule } from './api/document/document.module';
import { AgreementModule } from './api/agreement/agreement.module';

@Module({
  imports: [UserModule, BookModule, PrismaModule, JwtAuthModule, DocumentModule, AgreementModule],
})
export class AppModule {}
