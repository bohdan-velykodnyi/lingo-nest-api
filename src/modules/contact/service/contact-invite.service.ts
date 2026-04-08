import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudService } from 'core/service/crud/crud.service';
import { ContactInvite } from '../entity/contact-invite.entity';
import { Repository } from 'typeorm';
import { CreateContactInviteDto } from '../dto/contact-invite.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from 'modules/user/user.service';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContactInviteService extends CrudService<ContactInvite> {
  private frontendUrl: string;

  constructor(
    @InjectRepository(ContactInvite)
    private readonly contactInviteRepository: Repository<ContactInvite>,
    private readonly mailerService: MailerService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super(contactInviteRepository);
    this.frontendUrl = configService.get<string>('app.frontendUrl');
  }

  public async inviteContact({
    invited_email,
    inviter_id,
  }: CreateContactInviteDto): Promise<ContactInvite> {
    const inviter = await this.userService.findOneById(inviter_id);
    const token = crypto.randomUUID();

    const existingInvite = await this.findOne({
      where: { invited_email, inviter },
    });

    if (existingInvite) {
      throw new BadRequestException('Contact invite already exists');
    }

    if (!inviter) {
      throw new BadRequestException('Inviter not found');
    }

    await this.mailerService.sendMail({
      to: invited_email,
      subject: 'You have been invited to NestLingo!',
      template: 'contact-invite',
      context: {
        inviterName: inviter.name,
        inviteUrl: `${this.frontendUrl}/accept-invite/${token}`,
        appName: 'NestLingo',
        currentYear: new Date().getFullYear(),
        supportEmail: 'velykodnyibogdan@gmail.com',
      },
    });

    const contact_invite = await this.create({
      invited_email,
      inviter,
      token,
    });

    return contact_invite;
  }
}
