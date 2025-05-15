import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type MailerOptionsFactory } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { type ConfigType } from 'core/config';
import { join } from 'path';

@Injectable()
export class MailerConfigService implements MailerOptionsFactory {
  private config: ConfigType['mailer'];
  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<ConfigType['mailer']>('mailer');
  }

  createMailerOptions() {
    return {
      transport: {
        host: this.config.host,
        port: this.config.port,
        secure: true,
        tls: { ciphers: 'SSLv3' },
        auth: {
          user: this.config.user,
          pass: this.config.pass,
        },
      },
      defaults: {
        from: `"Nest Lingo" <${this.config.user}>`,
      },
      template: {
        dir: join(__dirname, '..', '..', 'email-templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  }
}
