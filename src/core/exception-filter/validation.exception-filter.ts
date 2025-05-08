import { Catch, type ExceptionFilter } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { ValidationException } from './exceptions/validation.exception';

@Catch(ValidationException)
export class ValidationErrorFilter implements ExceptionFilter {
  catch(exception: ValidationException) {
    const response = exception.getResponse() as { message: string | string[] };

    return new GraphQLError('Validation error', {
      extensions: {
        code: 'BAD_REQUEST',
        errors: response.message,
      },
    });
  }
}
