import { ForbiddenException, Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcryptjs';
import { type LoginDto } from './dto/login.dto';
import { type TokenResponse } from './response/token.response';
import { TokenService } from './modules/token/token.service';
import { type ChangePasswordDto } from './dto/change-password.dto';
import { UserService } from '../user/user.service';
import { type CreateUserDto } from '../user/dto/user.dto';
import { type User } from '../user/entity/user.entity';
import { RateLimiterService } from './modules/rate-limiter/rate-limiter.service';

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  public async registration(credentials: CreateUserDto): Promise<User> {
    const password = await this.hashPassword(credentials.password);

    return await this.userService.create({
      ...credentials,
      password,
    });
  }

  public async login(
    credentials: LoginDto,
    ip: string,
  ): Promise<TokenResponse> {
    try {
      await this.rateLimiter.checkLoginAttempts(ip, credentials.email);

      const user = await this.validateLogin(credentials);

      return await this.tokenService.generateTokens({
        user_id: user.id,
        role: user.role,
      });
    } catch (error) {
      await this.rateLimiter.recordFailedAttempt(ip, credentials.email);
      throw error;
    }
  }

  public async refreshTokens(refresh_token: string): Promise<TokenResponse> {
    const token = await this.tokenService.consumeRefreshToken(refresh_token);
    const user = await this.userService.findOneById(token.user_id);

    return this.tokenService.generateTokens({
      user_id: user.id,
      role: user.role,
    });
  }

  public async logout(user_id: string, refresh_token: string): Promise<string> {
    await this.tokenService.deleteRefreshToken(user_id, refresh_token);
    return 'success';
  }

  public async logoutFromAll(user_id: string): Promise<string> {
    await this.tokenService.deleteRefreshTokenForUser(user_id);
    return 'success';
  }

  public async changePassword(
    { old_password, new_password }: ChangePasswordDto,
    user_id: string,
  ): Promise<string> {
    const user = await this.userService.getUserWithPass({ id: user_id });

    const passwordMatch = await compare(old_password, user.password);

    if (!passwordMatch) throw new ForbiddenException('Incorrect password');

    const password = await this.hashPassword(new_password);

    await this.userService.updateAndReturn(user.id, {
      password,
    });

    return 'success';
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(12);
    const hashedPassword = await hash(password, salt);

    return hashedPassword;
  }

  private async validateLogin(credentials: LoginDto): Promise<User> {
    const { email, password } = credentials;

    const user = await this.userService.getUserWithPass({ email });

    if (!user) throw new ForbiddenException('Incorrect email or password');

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch)
      throw new ForbiddenException('Incorrect email or password');

    return user;
  }
}
