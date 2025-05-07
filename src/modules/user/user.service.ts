import { Injectable } from '@nestjs/common';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/user.dto';
import {
  Brackets,
  FindOneOptions,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async findOne(options: FindOneOptions<User>) {
    return this.userRepository.findOne(options);
  }

  public async create(user: CreateUserDto): Promise<User> {
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
      throw new Error('User not found');
    }

    return user;
  }

  public async updateAndReturn(
    id: string,
    partialEntity: QueryDeepPartialEntity<User>,
  ) {
    await this.update(id, partialEntity);
    const newUser = await this.userRepository.findOne({ where: { id } });

    if (newUser) {
      throw new Error('User not found');
    }

    return newUser;
  }

  public async update(
    id: string,
    partialEntity: QueryDeepPartialEntity<User>,
  ): Promise<UpdateResult> {
    try {
      return await this.userRepository.update(id, partialEntity);
    } catch (error) {
      throw new Error('The record was not found');
    }
  }
}
