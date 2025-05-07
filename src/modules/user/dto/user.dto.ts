import { Field, ID, InputType, OmitType } from '@nestjs/graphql';
import { User } from '../entity/user.entity';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

@InputType()
export class UserInput extends User {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'The email field cannot be empty' })
  @IsEmail({}, { message: 'Enter a valid email address' })
  @Transform((email) => email.value.toLowerCase().trim())
  email: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'The password field cannot be empty' })
  @MaxLength(64, {
    message: 'The name field must be less than or equal to 64 characters',
  })
  @MinLength(8, {
    message: 'The name field must be greater than or equal to 8 characters',
  })
  password: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'The name field cannot be empty' })
  @MaxLength(50, {
    message: 'The name field must be less than or equal to 50 characters',
  })
  name: string;
}

@InputType()
export class CreateUserDto extends OmitType(UserInput, ['id']) {}
