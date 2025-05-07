import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type ConfigType } from '../config';
import { type JwtModuleOptions, type JwtOptionsFactory } from '@nestjs/jwt';

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  private config: ConfigType['jwt'];

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<ConfigType['jwt']>('jwt');
  }

  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.config.key,
      signOptions: {
        expiresIn: this.config.access_expire,
      },
    };
  }
}
