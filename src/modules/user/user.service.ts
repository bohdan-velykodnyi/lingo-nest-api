import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { User } from './entity/user.entity';
import { type CreateUserDto } from './dto/user.dto';
import {
  type Brackets,
  type ObjectLiteral,
  Repository,
  type SelectQueryBuilder,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudService } from 'core/service/crud/crud.service';

@Injectable()
export class UserService extends CrudService<User> {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  public async create(user: CreateUserDto): Promise<User> {
    this.logger.log('Creating user: ', user);

    const findUser = this.userRepository.findOne({
      where: { email: user.email },
    });

    if (findUser) {
      throw new BadRequestException('User already exists');
    }

    return await this.userRepository.save(user);
  }

  public async getUserWithPass(
    where:
      | string
      | Brackets
      | ObjectLiteral
      | ObjectLiteral[]
      | ((qb: SelectQueryBuilder<User>) => string),
  ): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select()
      .addSelect('user.password')
      .where(where)
      .getOne();

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }
}
