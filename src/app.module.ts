import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import config, { GqlConfigService, TypeOrmConfigService } from './core/config';
import { ApolloDriver } from '@nestjs/apollo';
import { AuthorizationModule } from 'modules/auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerConfigService } from 'core/service/config/throttler.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfigService } from 'core/service/config/mailer.service';
import { ContactModule } from 'modules/contact/contact.module';

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
    MailerModule.forRootAsync({
      useClass: MailerConfigService,
    }),
    AuthorizationModule,
    ContactModule,
  ],
})
export class AppModule {}
