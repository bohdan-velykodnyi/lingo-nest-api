import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { TokenService } from '../token/token.service';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(protected readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return this.validate(context);
  }

  public async validate(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context).getContext();

    if (!ctx.req.headers.authorization) throw new GraphQLError('Unauthorized');

    const token = ctx.req.headers.authorization.replace('Bearer ', '');
    const res = await this.tokenService.validateAccessToken(token, false);

    ctx.req.user = res;

    return ctx;
  }
}
