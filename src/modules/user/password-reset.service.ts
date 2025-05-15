import { Injectable } from '@nestjs/common';
import { PasswordReset } from './entity/password-reset.entity';
import { CrudService } from 'core/service/crud/crud.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PasswordResetService extends CrudService<PasswordReset> {
  constructor(
    @InjectRepository(PasswordReset)
    readonly passwordResetRepository: Repository<PasswordReset>,
  ) {
    super(passwordResetRepository);
  }
}
