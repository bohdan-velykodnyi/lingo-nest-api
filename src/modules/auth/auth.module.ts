import { Module } from '@nestjs/common';

import { AuthorizationResolver } from './auth.resolver';
import { AuthorizationService } from './auth.service';
import { UserModule } from 'modules/user/user.module';
import { TokenModule } from './modules/token/token.module';
import { RateLimiterModule } from './modules/rate-limiter/rate-limiter.module';

@Module({
  imports: [UserModule, TokenModule, RateLimiterModule],
  providers: [AuthorizationResolver, AuthorizationService],
})
export class AuthorizationModule {}
