// performance.interceptor.ts
import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { tap } from 'rxjs';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler) {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - now;

        if (elapsed > 1000) {
          const parentType = info.parentType?.name;
          const fieldName = info.fieldName;

          this.logger.warn(
            `GraphQL ${parentType}.${fieldName} took ${elapsed}ms`,
          );
        }
      }),
    );
  }
}
