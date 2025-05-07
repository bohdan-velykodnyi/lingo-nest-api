import { Module } from '@nestjs/common';

import { AuthorizationResolver } from './auth.resolver';
import { AuthorizationService } from './auth.service';
import { UserModule } from 'modules/user/user.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [UserModule, TokenModule],
  providers: [AuthorizationResolver, AuthorizationService],
})
export class AuthorizationModule {}
