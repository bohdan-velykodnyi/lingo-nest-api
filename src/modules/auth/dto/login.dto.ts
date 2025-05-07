import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class LoginDto {
  @IsNotEmpty({ message: 'The email field cannot be empty' })
  @IsEmail({}, { message: 'Enter a valid email address' })
  @Transform((email) => email.value.toLowerCase().trim())
  @Field(() => String)
  email: string;

  @IsNotEmpty({ message: 'The password field cannot be empty' })
  @Field(() => String)
  password: string;
}
