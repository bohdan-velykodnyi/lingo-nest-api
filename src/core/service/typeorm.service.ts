import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type ConfigType } from '../config';
import {
  type TypeOrmModuleOptions,
  type TypeOrmOptionsFactory,
} from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  private config: ConfigType['typeorm'];
  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<ConfigType['typeorm']>('typeorm');
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      dropSchema: false,
      logging: this.configService.get('app.nodeEnv') !== 'production',
      entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
      ...this.config,
    };
  }
}
