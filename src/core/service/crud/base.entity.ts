import { PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

interface IBaseEntity {
  id: string;
}

@ObjectType({ isAbstract: true })
export abstract class BaseEntity implements IBaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
