import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { compare, genSalt, hash } from 'bcryptjs';
import { type LoginDto } from './dto/login.dto';
import { type TokenResponse } from './response/token.response';
import { TokenService } from './modules/token/token.service';
import { type ChangePasswordDto } from './dto/change-password.dto';
import { UserService } from '../user/user.service';
import { type CreateUserDto } from '../user/dto/user.dto';
import { type User } from '../user/entity/user.entity';
import { RateLimiterService } from './modules/rate-limiter/rate-limiter.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { randomBytes } from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailerService } from '@nestjs-modules/mailer';

const TOKEN_EXPIRY_HOURS = 1 * 60 * 60 * 1000;

@Injectable()
export class AuthorizationService {
  private readonly logger = new Logger(AuthorizationService.name);

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly rateLimiter: RateLimiterService,
    private readonly mailerService: MailerService,
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

      const user_id = user.id;

      return await this.tokenService.generateTokens({
        user_id,
      });
    } catch (error) {
      await this.rateLimiter.recordFailedAttempt(ip, credentials.email);
      throw error;
    }
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<string> {
    const { email } = forgotPasswordDto;
    const user = await this.userService.findOne({ where: { email } });

    if (!user) {
      this.logger.warn(
        `Password reset attempt for non-existent email: ${email}`,
      );
      return 'success';
    }

    const resetToken = randomBytes(32).toString('hex');

    const passwordResetExpires = new Date(Date.now() + TOKEN_EXPIRY_HOURS);

    await this.userService.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires,
    });

    this.logger.log(`Password reset token generated for user: ${user.email}`);

    await this.mailerService.sendMail({
      to: user.email,
      subject: `Password Reset Request for LingoNest`,
      template: 'forgot-password',
      context: {
        appName: 'LingoNest',
        userName: user.name,
        resetUrl: `https://lingonest.com/reset-password?token=${resetToken}`,
        expirationTime: '1 hour',
        currentYear: new Date().getFullYear(),
      },
    });

    return 'success';
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<string> {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userService.findOne({
      where: { passwordResetToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      await this.userService.update(user.id, {
        passwordResetToken: null,
        passwordResetExpires: null,
      });
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.userService.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    this.logger.log(`Password reset successful for user: ${user.email}`);

    await this.mailerService.sendMail({
      to: user.email,
      subject: `Your LingoNest Password Has Been Changed`,
      template: 'password-reset-success',
      context: {
        appName: 'LingoNest',
        userName: user.name,
        loginUrl: `https://lingonest.com/auth/login`,
        supportEmail: '',
        currentYear: new Date().getFullYear(),
      },
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
