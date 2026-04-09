import { User } from '@/modules/user/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContactStatus } from '../enum/contact-status.enum';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @ManyToOne(() => User, (user) => user.sent_invites)
  @JoinColumn({
    name: 'requester_id',
  })
  @Field(() => User)
  requester: User;

  @ManyToOne(() => User, (user) => user.received_invites)
  @JoinColumn({
    name: 'receiver_id',
  })
  @Field(() => User)
  receiver: User;

  @Column({ type: 'enum', enum: ContactStatus, default: ContactStatus.PENDING })
  @Field(() => ContactStatus)
  status: ContactStatus;

  @CreateDateColumn()
  @Field(() => Date)
  created_at: Date;
}
