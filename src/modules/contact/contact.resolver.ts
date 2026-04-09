import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ContactService } from './service/contact.service';
import { Contact } from './entity/contact.entity';
import { ContactStatus } from './enum/contact-status.enum';
import { CurrentUser } from '@/modules/auth/decorator/current-user';
import { JwtPayload } from '@/modules/auth/modules/token/types/jwt-payload';
import { ContactUnion } from './response/contact-union.response';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@/modules/auth/guards/auth.guard';

@Resolver()
export class ContactResolver {
  constructor(private readonly contactService: ContactService) {}

  @Query(() => [Contact])
  @UseGuards(GqlAuthGuard)
  getContacts(
    @Args('status', { type: () => ContactStatus, nullable: true })
    status: ContactStatus,
    @CurrentUser()
    { user_id }: JwtPayload,
  ): Promise<Contact[]> {
    return this.contactService.getContacts(user_id, status);
  }

  @Mutation(() => ContactUnion)
  @UseGuards(GqlAuthGuard)
  addContact(
    @Args('email', { type: () => String })
    email: string,
    @CurrentUser()
    { user_id }: JwtPayload,
  ): Promise<typeof ContactUnion> {
    return this.contactService.sendInvite(user_id, email);
  }

  @Mutation(() => Contact)
  @UseGuards(GqlAuthGuard)
  respondToContact(
    @Args('contact_id', { type: () => String })
    contact_id: string,
    @Args('accept', { type: () => Boolean })
    accept: boolean,
    @CurrentUser()
    { user_id }: JwtPayload,
  ): Promise<Contact> {
    return this.contactService.respondToInvite(contact_id, user_id, accept);
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  cancelContactInvite(
    @Args('contact_id', { type: () => String })
    contact_id: string,
    @CurrentUser()
    { user_id }: JwtPayload,
  ): Promise<string> {
    return this.contactService.cancelInvite(contact_id, user_id);
  }
}
