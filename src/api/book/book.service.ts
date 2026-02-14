import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Injectable()
export class BookService {
  constructor(private readonly DB: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    try {
      const createdBook = await this.DB.book.create({
        data: createBookDto,
        select: {
          name: true,
          description: true,
          summary: true,
          user: true
        }
      });
      return {
        success: true,
        message: 'Book successfully created',
        data: createdBook
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async findAll(userId: number) {
    const userBooksData = await this.DB.book.findMany({
      where: {
        userId: userId
      },
    });

    return {
      success: true,
      message: 'User wise data feeded succesfully',
      data: userBooksData
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} book`;
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`;
  }

  remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
