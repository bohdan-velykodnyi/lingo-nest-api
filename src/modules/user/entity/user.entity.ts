import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from '../enum/user-role.enum';
import { PasswordReset } from './password-reset.entity';
import { Contact } from '@/modules/contact/entity/contact.entity';

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({
    unique: true,
  })
  email: string;

  @Column({
    select: false,
  })
  password: string;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @OneToOne(() => PasswordReset, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'password_reset_id',
  })
  password_reset?: PasswordReset | null;

  @OneToMany(() => Contact, (contact) => contact.requester)
  sent_invites: Contact[];

  @OneToMany(() => Contact, (contact) => contact.receiver)
  received_invites: Contact[];
}
