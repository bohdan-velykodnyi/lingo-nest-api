import { LessThan, Repository } from 'typeorm';
import { Token } from './entity/token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { type JwtPayload } from './types/jwt-payload';
import { randomBytes } from 'crypto';
import * as dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { type ConfigType } from 'core/config';
import { JwtService } from '@nestjs/jwt';
import { Cron } from '@nestjs/schedule';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CrudService } from 'core/service/crud/crud.service';

export class TokenService extends CrudService<Token> {
  private expiresInRefresh: number;

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
    super(tokenRepository);
    const jwtConfig = configService.get<ConfigType['jwt']>('jwt');
    this.expiresInRefresh = jwtConfig.refresh_expire;
  }

  public async generateTokens(
    payload: JwtPayload,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const access_token = await this.createAccessToken(payload);
    const refresh_token = await this.createRefreshToken(payload.user_id);

    return {
      access_token,
      refresh_token,
    };
  }

  public async refreshBothTokens(refresh_token: string) {
    const token = await this.validateRefreshToken(refresh_token);

    const tokens = await this.generateTokens({
      user_id: token.user_id,
    });

    await this.deleteByCriteria({ id: token.id });

    return tokens;
  }

  public async deleteRefreshTokenForUser(user_id: string): Promise<void> {
    await this.deleteByCriteria({ user_id });
  }

  public async deleteRefreshToken(
    user_id: string,
    refresh_token: string,
  ): Promise<void> {
    await this.deleteByCriteria({
      user_id,
      refresh_token,
    });
  }

  public async validateAccessToken(token: string): Promise<Token> {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  public async validateRefreshToken(refresh_token: string): Promise<Token> {
    const token = await this.findOne({
      where: { refresh_token },
    });

    if (!token) {
      throw new BadRequestException('Refresh token not found');
    }

    const current_date = dayjs().unix();

    if (token.expires_in < current_date) {
      throw new UnauthorizedException('Refresh token expired');
    }

    return token;
  }

  private async createAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.sign(payload);
  }

  private async createRefreshToken(user_id: string): Promise<string> {
    const refresh_token = randomBytes(64).toString('hex');
    const expires_in = dayjs().add(this.expiresInRefresh, 'd').unix();

    const refresh: Omit<Token, 'id'> = {
      user_id,
      refresh_token,
      expires_in,
    };

    await this.create(refresh);

    return refresh_token;
  }

  @Cron('0 0 * * *') // Run daily
  private async cleanupExpiredTokens(): Promise<void> {
    const expiredTokens = await this.tokenRepository.find({
      where: {
        expires_in: LessThan(dayjs().unix()),
      },
    });

    for (const token of expiredTokens) {
      await this.deleteByCriteria({ id: token.id });
    }
  }
}
