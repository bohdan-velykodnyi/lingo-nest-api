import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { LoginAttempt } from './entity/login-attempt.entity';
import { Cron } from '@nestjs/schedule';
import { CrudService } from '@/core/service/crud/crud.service';

@Injectable()
export class RateLimiterService extends CrudService<LoginAttempt> {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly MAX_ATTEMPTS = 5;
  private readonly BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

  constructor(
    @InjectRepository(LoginAttempt)
    private readonly loginAttemptRepository: Repository<LoginAttempt>,
  ) {
    super(loginAttemptRepository);
  }

  public async checkLoginAttempts(ip: string, email: string): Promise<void> {
    const attempts = await this.getRecentAttempts(ip, email);

    if (this.isBlocked(attempts)) {
      throw new ForbiddenException(
        'Too many login attempts. Please try again later.',
      );
    }
  }

  public async recordFailedAttempt(ip: string, email: string): Promise<void> {
    this.logger.warn(`Failed login attempt from IP: ${ip}, Email: ${email}`);
    await this.loginAttemptRepository.save({
      ip,
      email,
      timestamp: new Date(),
      success: false,
    });
  }

  private async getRecentAttempts(
    ip: string,
    email: string,
  ): Promise<LoginAttempt[]> {
    const timeWindow = new Date(Date.now() - this.BLOCK_DURATION);

    return this.findAll({
      where: [
        { ip, timestamp: MoreThan(timeWindow) },
        { email, timestamp: MoreThan(timeWindow) },
      ],
      order: { timestamp: 'DESC' },
    });
  }

  private isBlocked(attempts: LoginAttempt[]): boolean {
    const failedAttempts = attempts.filter((attempt) => !attempt.success);
    return failedAttempts.length >= this.MAX_ATTEMPTS;
  }

  @Cron('0 0 * * *') // Run daily
  public async cleanupOldRecords(): Promise<void> {
    const timeWindow = new Date(Date.now() - this.BLOCK_DURATION);
    await this.deleteByCriteria({
      timestamp: LessThan(timeWindow),
    });
    this.logger.log('Old login attempts c leaned up');
  }
}
