import { PickType } from '@nestjs/graphql';
import { ContactInvite } from '../entity/contact-invite.entity';

export class CreateContactInviteDto extends PickType(ContactInvite, [
  'invited_email',
]) {
  inviter_id: string;
}
