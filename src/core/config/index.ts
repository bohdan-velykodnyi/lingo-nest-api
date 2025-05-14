import appConfig from './app.config';
import graphqlConfig from './graphql.config';
import { GqlConfigService } from '../service/config/graphql.service';
import { TypeOrmConfigService } from '../service/config/typeorm.service';
import typeormConfig from './typeorm.config';
import jwtConfig from './jwt.config';
import mailerConfig from './mailer.config';

export default [
  appConfig,
  graphqlConfig,
  typeormConfig,
  jwtConfig,
  mailerConfig,
];

export { GqlConfigService, TypeOrmConfigService };

export interface ConfigType {
  app: {
    port: number;
    nodeEnv: string;
  };
  graphql: {
    playground: boolean;
    debug: boolean;
  };
  typeorm: {
    type: 'postgres';
    host: string;
    port: number;
    password: string;
    name: string;
    username: string;
    synchronize: boolean;
  };
  jwt: {
    key: string;
    access_expire: number;
    refresh_expire: number;
  };
  mailer: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
}
