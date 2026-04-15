import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthorizationService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { TokenResponse } from './response/token.response';
import { User } from '@/modules/user/entity/user.entity';
import { CreateUserDto } from '@/modules/user/dto/user.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorator/current-user';
import { JwtPayload } from './modules/token/types/jwt-payload';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserService } from '@/modules/user/user.service';
import { Ip } from '@/core/decorator/ip.decorator';
import { TokenService } from './modules/token/token.service';

import { ForgotPasswordService } from './modules/forgot-password/forgot-password.service';
import { ForgotPasswordDto } from './modules/forgot-password/dto/forgot-password.dto';
import { ResetPasswordDto } from './modules/forgot-password/dto/reset-password.dto';

@Resolver()
export class AuthorizationResolver {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly forgotPasswordService: ForgotPasswordService,
  ) {}

  @Mutation(() => TokenResponse)
  login(
    @Args('credentials', { type: () => LoginDto })
    credentials: LoginDto,
    @Ip() ip: string,
  ): Promise<TokenResponse> {
    return this.authorizationService.login(credentials, ip);
  }

  @Mutation(() => User)
  registration(
    @Args('credentials', { type: () => CreateUserDto })
    credentials: CreateUserDto,
  ): Promise<User> {
    return this.authorizationService.registration(credentials);
  }

  @Mutation(() => TokenResponse)
  refreshTokens(
    @Args('refresh_token', { type: () => String })
    refresh_token: string,
  ): Promise<TokenResponse> {
    return this.authorizationService.refreshTokens(refresh_token);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => String)
  logout(
    @Args('refresh_token') refresh_token: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<string> {
    return this.authorizationService.logout(user.user_id, refresh_token);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => String)
  logoutFromAll(@CurrentUser() user: JwtPayload): Promise<string> {
    return this.authorizationService.logoutFromAll(user.user_id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => String)
  changePassword(
    @Args('passwords', { type: () => ChangePasswordDto })
    passwords: ChangePasswordDto,
    @CurrentUser() { user_id }: JwtPayload,
  ): Promise<string> {
    return this.authorizationService.changePassword(passwords, user_id);
  }

  @Mutation(() => String)
  forgotPassword(
    @Args('forgotPasswordDto', { type: () => ForgotPasswordDto })
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<string> {
    return this.forgotPasswordService.forgotPassword(forgotPasswordDto);
  }

  @Mutation(() => String)
  resetPassword(
    @Args('resetPasswordDto', { type: () => ResetPasswordDto })
    resetPasswordDto: ResetPasswordDto,
  ): Promise<string> {
    return this.forgotPasswordService.resetPassword(resetPasswordDto);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  getCurrentUser(
    @CurrentUser()
    { user_id }: JwtPayload,
  ): Promise<User> {
    return this.userService.findOne({ where: { id: user_id } });
  }
}
