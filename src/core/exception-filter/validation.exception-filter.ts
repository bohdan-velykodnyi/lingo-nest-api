import {
  Catch,
  type ExceptionFilter,
  BadRequestException,
} from '@nestjs/common';
import { GraphQLError } from 'graphql';

@Catch(BadRequestException)
export class ValidationErrorFilter implements ExceptionFilter {
  catch(exception: BadRequestException) {
    const response = exception.getResponse() as { message: string | string[] };

    return new GraphQLError('Validation error', {
      extensions: {
        code: 'BAD_USER_INPUT',
        errors: response.message,
      },
    });
  }
}
