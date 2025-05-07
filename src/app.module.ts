import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import config, { GqlConfigService, TypeOrmConfigService } from './core/config';
import { ApolloDriver } from '@nestjs/apollo';
import { AuthorizationModule } from 'modules/auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerConfigService } from 'core/service/throttler.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
      envFilePath: ['.env'],
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      useClass: GqlConfigService,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ThrottlerModule.forRootAsync({
      useClass: ThrottlerConfigService,
    }),
    AuthorizationModule,
  ],
})
export class AppModule {}
