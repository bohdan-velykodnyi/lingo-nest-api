import { type FindOptionsWhere, LessThan, Repository } from 'typeorm';
import { Token } from './entity/token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { type JwtPayload } from './types/jwt-payload';
import { randomBytes } from 'crypto';
import * as dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { type ConfigType } from 'core/config';
import { JwtService } from '@nestjs/jwt';
import { Cron } from '@nestjs/schedule';

export class TokenService {
  private expiresInRefresh: number;

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
    configService: ConfigService,
  ) {
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

  public async createAccessTokenFromRefreshToken(
    refresh_token: string,
    access_payload: JwtPayload,
  ) {
    const token = await this.validateRefreshToken(refresh_token);

    const tokens = await this.generateTokens(access_payload);

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
    return this.jwtService.verify(token);
  }

  public async validateRefreshToken(refresh_token: string): Promise<Token> {
    const token = await this.tokenRepository.findOne({
      where: { refresh_token },
    });

    if (!token) {
      throw new Error('Refresh token not found');
    }

    const current_date = dayjs().unix();

    if (token.expires_in < current_date) {
      throw new Error('Refresh token expired');
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

    await this.tokenRepository.save(refresh);

    return refresh_token;
  }

  private async deleteByCriteria(
    criteria: FindOptionsWhere<Token>,
  ): Promise<void> {
    try {
      await this.tokenRepository.delete(criteria);
    } catch (error) {
      throw new Error('The records was not found');
    }
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
