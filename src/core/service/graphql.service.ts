import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { ConfigType } from '../config';
import { ApolloDriverConfig } from '@nestjs/apollo';

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  private config: ConfigType['graphql'];
  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<ConfigType['graphql']>('graphql');
  }

  createGqlOptions(): ApolloDriverConfig {
    return {
      installSubscriptionHandlers: true,
      autoSchemaFile: 'src/schema.gql',
      sortSchema: true,
      context: ({ req, connection }) =>
        connection ? { req: connection.context } : { req },
      ...this.config,
    };
  }
}
