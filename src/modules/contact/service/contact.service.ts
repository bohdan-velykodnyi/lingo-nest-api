import { BadRequestException, Injectable } from '@nestjs/common';
import { CrudService } from '@/core/service/crud/crud.service';
import { Contact } from '../entity/contact.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactStatus } from '../enum/contact-status.enum';
import { UserService } from '@/modules/user/user.service';
import { ContactInviteService } from './contact-invite.service';
import { ContactInvite } from '../entity/contact-invite.entity';

@Injectable()
export class ContactService extends CrudService<Contact> {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly userService: UserService,
    private readonly contactInviteService: ContactInviteService,
  ) {
    super(contactRepository);
  }

  public async sendInvite(
    requester_id: string,
    email: string,
  ): Promise<Contact | ContactInvite> {
    const receiver = await this.userService.findOne({
      where: { email },
    });

    if (!receiver) {
      return await this.contactInviteService.inviteContact({
        invited_email: email,
        inviter_id: requester_id,
      });
    }

    if (requester_id === receiver.id) {
      throw new BadRequestException('Cannot invite yourself');
    }

    const existing = await this.findOne({
      where: [
        { requester: { id: requester_id }, receiver: { id: receiver.id } },
        { requester: { id: receiver.id }, receiver: { id: requester_id } },
      ],
    });

    if (existing)
      throw new BadRequestException('Contact request already exists');

    return this.create({
      requester: { id: requester_id },
      receiver: { id: receiver.id },
      status: ContactStatus.PENDING,
    });
  }

  public async respondToInvite(
    contact_id: string,
    user_id: string,
    accept: boolean,
  ): Promise<Contact> {
    const contact = await this.findOne({
      where: [{ id: contact_id, receiver: { id: user_id } }],
    });

    if (!contact) {
      throw new BadRequestException('Contact not found');
    }

    contact.status = accept ? ContactStatus.ACCEPTED : ContactStatus.REJECTED;
    return this.updateAndReturn(contact_id, contact);
  }

  public async cancelInvite(
    contact_id: string,
    user_id: string,
  ): Promise<string> {
    const contact = await this.findOne({
      where: [{ id: contact_id, requester: { id: user_id } }],
    });

    if (!contact) {
      throw new BadRequestException('Contact not found');
    }

    return await this.deleteById(contact_id);
  }

  public async getContacts(
    user_id: string,
    status?: ContactStatus,
  ): Promise<Contact[]> {
    return this.findAll({
      where: [
        { requester: { id: user_id }, status },
        { receiver: { id: user_id }, status: ContactStatus.ACCEPTED },
      ],
      relations: ['requester', 'receiver'],
    });
  }
}
