import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthService } from 'src/config/jwt/jwt.service';
import type {Request} from 'express';

@Injectable()
export class JwtguardGuard implements CanActivate {
  constructor(private readonly jwtService: JwtAuthService){}

  async canActivate(
    context: ExecutionContext): Promise<boolean> {
    const req:Request = context.switchToHttp().getRequest();
    const tokenString = req.headers.authorization;
    console.log(tokenString);
    const token = tokenString?.split(' ')[1];
    if(!token) return false;
    const checkToken = await this.jwtService.verifyToken(token);
    return checkToken;
  }
}
