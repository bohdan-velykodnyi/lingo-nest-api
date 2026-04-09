import { Module } from '@nestjs/common';
import { ForgotPasswordService } from './forgot-password.service';
import { UserModule } from '@/modules/user/user.module';

@Module({
  imports: [UserModule],
  providers: [ForgotPasswordService],
  exports: [ForgotPasswordService],
})
export class ForgotPasswordModule {}
