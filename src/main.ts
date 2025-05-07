import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import 'tsconfig-paths/register';
import { useContainer } from 'class-validator';
import { ValidationPipe } from '@nestjs/common';
import {
  GraphqlErrorFilter,
  ValidationErrorFilter,
} from 'core/exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalFilters(new GraphqlErrorFilter(), new ValidationErrorFilter());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(configService.get('app.port'));
}
bootstrap();
