import { Module } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';
import { LoginAttempt } from './entity/login-attempt.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([LoginAttempt])],
  providers: [RateLimiterService],
  exports: [RateLimiterService],
})
export class RateLimiterModule {}
