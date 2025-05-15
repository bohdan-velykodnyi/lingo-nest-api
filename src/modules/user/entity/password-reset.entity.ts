import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PasswordReset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  token?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  expires?: Date | null;
}
