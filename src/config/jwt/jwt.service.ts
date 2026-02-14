import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthService {
    constructor(private readonly jwt:JwtService) {}

    async gettoken() {
        try {
            const token = await this.jwt.signAsync({
                name: 'amila'
            });
            return token;
        } catch (e) {
            throw new InternalServerErrorException('Internal server error');
        }
    }

    async verifyToken(token: string):Promise<boolean> {
        try {
            const verify = await this.jwt.verifyAsync(token);
            if(verify) {
                return true;
            } else return false;
        } catch (e) {
            console.log(e);
            throw new UnauthorizedException();
        }
    }
}