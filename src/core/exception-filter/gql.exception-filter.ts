import { Catch, type ExceptionFilter } from '@nestjs/common';
import { GraphQLError } from 'graphql';

@Catch(Error)
export class GraphqlErrorFilter implements ExceptionFilter {
  catch(exception: Error) {
    return new GraphQLError('Internal server error', {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
        message: exception.message,
      },
    });
  }
}
