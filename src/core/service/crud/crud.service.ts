import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  FindOneOptions,
  FindManyOptions,
  DeepPartial,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export abstract class CrudService<T extends BaseEntity> {
  constructor(
    @InjectRepository(Repository<T>)
    protected readonly repository: Repository<T>,
  ) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async findOneById(id: string, options?: FindOneOptions<T>): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
      ...options,
    });

    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }

    return entity;
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return await this.repository.findOne(options);
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }

  async count(criteria?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({
      where: criteria,
    });
  }

  async update(id: string, data: QueryDeepPartialEntity<T>): Promise<void> {
    const updated = await this.repository.update(id, data);

    if (updated.affected === 0) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
  }

  async save(entity: T): Promise<T> {
    const existingEntity = await this.repository.findOne({
      where: { id: entity.id } as FindOptionsWhere<T>,
    });
    if (!existingEntity) {
      throw new NotFoundException(`Entity with ID ${entity.id} not found`);
    }
    return await this.repository.save(entity);
  }

  async updateAndReturn(
    id: string,
    data: QueryDeepPartialEntity<T>,
  ): Promise<T> {
    const updated = await this.repository.update(id, data);

    if (updated.affected === 0) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }

    return await this.findOneById(id);
  }

  async deleteById(id: string): Promise<string> {
    const entity = await this.findOneById(id);

    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }

    await this.repository.remove(entity);

    return id;
  }

  async deleteByCriteria(criteria: FindOptionsWhere<T>): Promise<void> {
    const entity = await this.findOne({ where: criteria });

    if (!entity) {
      throw new NotFoundException(
        `Entity with criteria ${JSON.stringify(criteria)} not found`,
      );
    }

    await this.repository.delete(criteria);
  }
}
