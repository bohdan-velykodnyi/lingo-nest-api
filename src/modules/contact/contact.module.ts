import { Module } from '@nestjs/common';
import { ContactService } from './service/contact.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entity/contact.entity';
import { ContactResolver } from './contact.resolver';
import { UserModule } from '@/modules/user/user.module';
import { ContactInvite } from './entity/contact-invite.entity';
import { ContactInviteService } from './service/contact-invite.service';

@Module({
  imports: [TypeOrmModule.forFeature([Contact, ContactInvite]), UserModule],
  providers: [ContactService, ContactInviteService, ContactResolver],
})
export class ContactModule {}
