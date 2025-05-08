import { Catch, HttpException, type ExceptionFilter } from '@nestjs/common';
import { GraphQLError } from 'graphql';

const STATUS_CODES = {
  400: {
    code: 'BAD_REQUEST',
    message: 'Bad Request',
  },
  401: {
    code: 'UNAUTHORIZED',
    message: 'Unauthorized',
  },
  403: {
    code: 'FORBIDDEN',
    message: 'Forbidden resource',
  },
  404: {
    code: 'NOT_FOUND',
    message: 'Not Found',
  },
  409: {
    code: 'CONFLICT',
    message: 'Conflict',
  },
  422: {
    code: 'UNPROCESSABLE_ENTITY',
    message: 'Unprocessable Entity',
  },
  429: {
    code: 'TOO_MANY_REQUESTS',
    message: 'Too Many Requests',
  },
  500: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal Server Error',
  },
};

@Catch(HttpException)
export class GraphqlErrorFilter implements ExceptionFilter {
  catch(exception: HttpException) {
    const status = STATUS_CODES[exception.getStatus() || 500];

    return new GraphQLError(status.message, {
      extensions: {
        code: status.code,
        message: exception.message,
      },
    });
  }
}
