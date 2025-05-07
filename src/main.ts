import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import 'tsconfig-paths/register';
import { ValidationPipe } from '@nestjs/common';
import {
  GraphqlErrorFilter,
  ValidationErrorFilter,
} from 'core/exception-filter';
import { PerformanceInterceptor } from 'core/interceptor/performance.interceptor';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalFilters(new GraphqlErrorFilter(), new ValidationErrorFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new PerformanceInterceptor());
  app.use(compression());
  app.use(helmet());
  app.enableCors();

  await app.listen(configService.get('app.port'));
}
bootstrap();
