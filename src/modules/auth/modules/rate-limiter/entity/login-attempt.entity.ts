import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LoginAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ip: string;

  @Column()
  email: string;

  @Column()
  timestamp: Date;

  @Column()
  success: boolean;
}
