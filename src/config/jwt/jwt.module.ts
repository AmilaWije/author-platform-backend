import { Global, Module } from '@nestjs/common';
import { JwtAuthService } from './jwt.service';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  providers: [JwtAuthService],
  exports: [JwtAuthService],
  imports: [
    JwtModule.register({
      secret: 'yoursecret',
      signOptions: {
        expiresIn: '2m'
      }
    })
  ]
})

export class JwtAuthModule {}