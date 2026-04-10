# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
yarn start:dev        # watch mode
yarn start:debug      # debug + watch mode

# Build
yarn build            # compile to dist/

# Testing
yarn test             # unit tests (rootDir: src, matches *.spec.ts)
yarn test:watch       # watch mode
yarn test:e2e         # e2e tests (test/jest-e2e.json)
yarn test:cov         # coverage

# Code quality
yarn lint             # ESLint with autofix
yarn format           # Prettier
yarn typecheck        # tsc --noEmit
```

Run a single test file:
```bash
yarn test --testPathPattern=auth.service
```

## Architecture

NestJS + GraphQL (code-first, Apollo) + TypeORM + PostgreSQL.

**Path alias:** `@/` maps to `src/` (configured in `tsconfig.json` and registered at runtime via `tsconfig-paths`).

### Directory layout

```
src/
  core/              # Framework-level infrastructure (not domain logic)
    config/          # registerAs() config factories: app, graphql, jwt, mailer, typeorm
    service/
      config/        # NestJS ConfigService wrappers (GqlConfigService, TypeOrmConfigService, etc.)
      crud/          # Abstract CrudService<T> + BaseEntity — base class for all entity services
    decorator/       # Custom param decorators (e.g. @Ip())
    exception-filter/# GraphqlErrorFilter (HttpException → GraphQLError) + ValidationErrorFilter
    interceptor/     # PerformanceInterceptor
    logger/          # FileBasedLogger (writes to logs/)
    pipe/            # CustomValidationPipe (class-validator)
    email-templates/ # Handlebars (.hbs) templates for mailer
  modules/
    auth/            # Login, registration, logout, change-password, refresh tokens
      modules/
        token/       # JWT access token + opaque refresh token (stored in DB, daily cleanup cron)
        rate-limiter/# Login attempt tracking
        forgot-password/ # Forgot/reset password flow + email
    user/            # User entity, UserService, password-reset entity
    contact/         # Contact invite system (pending/accepted/rejected states)
```

### Key patterns

**Entity services** extend `CrudService<T extends BaseEntity>` (`src/core/service/crud/crud.service.ts`). BaseEntity provides a UUID primary key. `User` does not extend BaseEntity (it manages its own PK directly).

**GraphQL schema** is auto-generated to `src/schema.gql` (code-first). Entities decorated with `@ObjectType()` and `@Field()` serve as both DB entities and GQL types.

**Config** uses `@nestjs/config` with typed `registerAs()` namespaces. Access via `configService.get<ConfigType['jwt']>('jwt')`. All config factories are loaded in `ConfigModule.forRoot` in `app.module.ts`.

**Auth flow:** JWT access token (short-lived, verified in-memory) + opaque refresh token (stored in `token` table, expiry checked against DB). `GqlAuthGuard` extracts Bearer token from `req.headers.authorization`. Expired refresh tokens are cleaned up by a daily `@Cron` in `TokenService`.

**Error handling:** `GraphqlErrorFilter` maps NestJS `HttpException` status codes to GraphQL error extensions with `code` + `message`. Validation errors go through `ValidationErrorFilter` separately.

**Database:** PostgreSQL via TypeORM. Schema sync controlled by `DATABASE_SYNCHRONIZE` env var (use `true` only in dev). No migration files present — schema is managed via `synchronize`.

### Environment variables

Required in `.env`:
```
DATABASE_TYPE, DATABASE_HOST, DATABASE_PORT, DATABASE_PASSWORD, DATABASE_NAME, DATABASE_USERNAME
DATABASE_SYNCHRONIZE
JWT_SECRET, JWT_EXPIRE, JWT_REFRESH_EXPIRE
MAILER_HOST, MAILER_PORT, MAILER_USER, MAILER_PASSWORD, MAILER_FROM
APP_PORT, NODE_ENV
GQL_PLAYGROUND, GQL_DEBUG
```
