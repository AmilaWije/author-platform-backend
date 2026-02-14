import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { LoginUserData } from './dto/user-request-dto';
import { JwtAuthService } from 'src/config/jwt/jwt.service';

@Injectable()
export class UserService {
  constructor(private readonly DB: PrismaService, private readonly jwt: JwtAuthService){}

  async create(userData: CreateUserDto) {
    try {
      const newUser = await this.DB.user.create({
        data: userData,
        select: {
          f_name: true,
          l_name: true,
          username: true,
          password: true,
          email: true,
          country: true
        }
      });
      return {
        success: true,
        message: 'User Registration Successfully',
        data: newUser
      }
    } catch (e) {
      if(e.code == 'P2002')throw new BadRequestException(`${userData.username} is already in use`);
      throw new InternalServerErrorException('internal server error');
    }
  }

  async findAll() {
    const allUsers = await this.DB.user.findMany();
    return {
      success: true,
      message: 'All users Feeded',
      data: allUsers
    }
  }

  async login(userLoginData: LoginUserData) {
    try {
      const user = await this.DB.user.findUnique({
        where: {
          username:userLoginData.username
        }
      });
      if(!user) throw new NotFoundException(`${userLoginData.username} not found`);
      if(userLoginData.password !== user.password)throw new BadRequestException(`password`);
      return this.jwt.gettoken();
    } catch (e) {
      if(e instanceof HttpException) throw e;
      throw new InternalServerErrorException('Internal server error exception');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
