import { Global, Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entity/token.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigService } from '@/core/service/config/jwt.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
