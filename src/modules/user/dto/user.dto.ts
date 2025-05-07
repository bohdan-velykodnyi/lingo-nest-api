import { Field, InputType, OmitType } from '@nestjs/graphql';
import { User } from '../entity/user.entity';

@InputType()
export class UserInput extends User {}

@InputType()
export class CreateUserDto extends OmitType(UserInput, ['id']) {
  @Field(() => String)
  password: string;
}
