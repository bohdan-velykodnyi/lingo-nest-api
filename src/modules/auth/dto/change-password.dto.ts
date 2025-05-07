import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class ChangePasswordDto {
  @IsNotEmpty({ message: 'The password field cannot be empty' })
  @Field(() => String)
  old_password: string;

  @IsNotEmpty({ message: 'The password field cannot be empty' })
  @Field(() => String)
  new_password: string;
}
