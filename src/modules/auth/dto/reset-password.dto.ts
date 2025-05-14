import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

@InputType()
export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Token cannot be empty.' })
  @Field(() => String)
  token: string;

  @IsNotEmpty({ message: 'The password field cannot be empty' })
  @MaxLength(64, {
    message: 'The name field must be less than or equal to 64 characters',
  })
  @MinLength(8, {
    message: 'The name field must be greater than or equal to 8 characters',
  })
  @Field(() => String)
  newPassword: string;
}
