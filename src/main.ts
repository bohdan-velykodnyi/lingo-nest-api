import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import 'tsconfig-paths/register';
import { GraphqlErrorFilter } from 'core/exeption-filter/gql.exeption-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalFilters(new GraphqlErrorFilter());

  await app.listen(configService.get('app.port'));
}
bootstrap();
