import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';

import { User } from './entity/user.entity';
import { PasswordReset } from './entity/password-reset.entity';
import { PasswordResetService } from './password-reset.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, PasswordReset])],
  providers: [UserService, PasswordResetService],
  exports: [UserService, PasswordResetService],
})
export class UserModule {}
