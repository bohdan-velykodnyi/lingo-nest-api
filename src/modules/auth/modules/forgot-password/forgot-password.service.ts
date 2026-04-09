import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { randomBytes } from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserService } from '@/modules/user/user.service';
import { MailerService } from '@nestjs-modules/mailer';
import { genSalt, hash } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { PasswordResetService } from '@/modules/user/password-reset.service';

const TOKEN_EXPIRY_HOURS = 1 * 60 * 60 * 1000;

@Injectable()
export class ForgotPasswordService {
  private readonly logger = new Logger(ForgotPasswordService.name);
  private frontendUrl: string;

  constructor(
    private readonly userService: UserService,
    private readonly passwordResetService: PasswordResetService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = configService.get<string>('app.frontendUrl');
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

    await this.userService.save({
      ...user,
      password_reset: {
        id: user.password_reset?.id,
        token: resetToken,
        expires: passwordResetExpires,
      },
    });

    this.logger.log(`Password reset token generated for user: ${user.email}`);

    await this.mailerService.sendMail({
      to: user.email,
      subject: `Password Reset Request for NestLingo`,
      template: 'forgot-password',
      context: {
        appName: 'NestLingo',
        userName: user.name,
        resetUrl: `${this.frontendUrl}/auth/reset-password?token=${resetToken}`,
        expirationTime: '1 hour',
        currentYear: new Date().getFullYear(),
      },
    });

    return 'success';
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<string> {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userService.findOne({
      where: { password_reset: { token } },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    if (
      !user.password_reset.expires ||
      user.password_reset.expires < new Date()
    ) {
      await this.passwordResetService.deleteById(user.password_reset.id);
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.userService.update(user.id, {
      password: hashedPassword,
      password_reset: null,
    });

    await this.passwordResetService.deleteById(user.password_reset.id);

    this.logger.log(`Password reset successful for user: ${user.email}`);

    await this.mailerService.sendMail({
      to: user.email,
      subject: `Your NestLingo Password Has Been Changed`,
      template: 'password-reset-success',
      context: {
        appName: 'NestLingo',
        userName: user.name,
        loginUrl: `${this.frontendUrl}/auth/login`,
        supportEmail: '',
        currentYear: new Date().getFullYear(),
      },
    });

    return 'success';
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(12);
    const hashedPassword = hash(password, salt);

    return hashedPassword;
  }
}
