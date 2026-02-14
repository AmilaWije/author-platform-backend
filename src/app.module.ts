import { Module } from '@nestjs/common';
import { UserModule } from './api/user/user.module';
import { BookModule } from './api/book/book.module';

@Module({
  imports: [UserModule, BookModule]
})
export class AppModule {}
