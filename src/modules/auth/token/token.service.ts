import { FindOptionsWhere, Repository } from 'typeorm';
import { Token } from './entity/token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from './types/jwt-payload';
import { randomBytes } from 'crypto';
import * as dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from 'core/config';
import { JwtService } from '@nestjs/jwt';

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

  public async createAccessTokenFromRefreshToken(
    refresh_token: string,
    access_payload: JwtPayload,
  ) {
    const token = await this.validateRefreshToken(refresh_token);

    const access_token = await this.createAccessToken({
      ...access_payload,
    });

    const new_refresh_token = await this.createRefreshToken(token.user_id);

    await this.deleteByCriteria({ id: token.id });

    return {
      access_token,
      refresh_token: new_refresh_token,
    };
  }

  public async createAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.sign(payload);
  }

  public async createRefreshToken(user_id: string): Promise<string> {
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

  public async validateRefreshToken(refresh_token: string): Promise<Token> {
    const token = await this.tokenRepository.findOne({
      where: { refresh_token },
    });

    if (!token) throw new Error('Refresh token not found');

    const current_date = dayjs().unix();

    if (token.expires_in < current_date) {
      throw new Error('Refresh token expired');
    }

    return token;
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
}
