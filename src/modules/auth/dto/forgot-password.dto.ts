import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'The email field cannot be empty' })
  @IsEmail({}, { message: 'Enter a valid email address' })
  @Transform((email) => email.value.toLowerCase().trim())
  @Field(() => String)
  email: string;
}
