import {
  type ThrottlerModuleOptions,
  type ThrottlerOptionsFactory,
} from '@nestjs/throttler';

export class ThrottlerConfigService implements ThrottlerOptionsFactory {
  createThrottlerOptions(): ThrottlerModuleOptions {
    return [
      {
        name: 'short',
        ttl: 1000,
        limit: 20,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 100,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 200,
      },
    ];
  }
}
