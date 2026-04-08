import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { User } from 'modules/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class ContactInvite {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => String)
  @Transform((email) => email.value.toLowerCase().trim())
  invited_email: string;

  @Column()
  token: string;

  @Column({ default: false })
  accepted: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'inviter_id',
  })
  inviter: User;
}
