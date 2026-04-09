import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import 'tsconfig-paths/register';
import {
  GraphqlErrorFilter,
  ValidationErrorFilter,
} from '@/core/exception-filter';
import { PerformanceInterceptor } from '@/core/interceptor/performance.interceptor';
import compression from 'compression';
import helmet from 'helmet';
import { FileBasedLogger } from '@/core/logger/file-based.logger';
import { CustomValidationPipe } from '@/core/pipe/class-validator.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);

  app.useLogger(new FileBasedLogger());
  app.useGlobalFilters(new GraphqlErrorFilter(), new ValidationErrorFilter());
  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalInterceptors(new PerformanceInterceptor());
  app.use(compression());
  app.use(
    helmet({
      contentSecurityPolicy:
        configService.get('app.nodeEnv') === 'production' ? undefined : false,
    }),
  );
  app.enableCors();

  await app.listen(configService.get('app.port'));
}
bootstrap();
