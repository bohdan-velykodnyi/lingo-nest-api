import { registerEnumType } from '@nestjs/graphql';

export enum ContactStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

registerEnumType(ContactStatus, {
  name: 'ContactStatus',
});
