import { createUnionType } from '@nestjs/graphql';
import { Contact } from '../entity/contact.entity';
import { ContactInvite } from '../entity/contact-invite.entity';

export const ContactUnion = createUnionType({
  name: 'ContactUnion',
  types: () => [Contact, ContactInvite] as const,
  resolveType: (value) => {
    if ('status' in value) {
      return Contact;
    }
    if ('invited_email' in value) {
      return ContactInvite;
    }

    return null;
  },
});
