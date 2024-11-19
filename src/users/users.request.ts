import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Match } from 'src/utils/decorators/match.decorator';

export class RegisterReqBody {
  @ApiProperty({
    name: 'name',
    description: 'Name of the user',
    required: true,
    type: String,
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    name: 'email',
    description: 'Email of the user',
    required: true,
    type: String,
    example: 'abcxyz@123.co',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    name: 'password',
    description: 'Password of the user',
    required: true,
    type: String,
    example: 'Abc123!@#',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;

  @ApiProperty({
    name: 'confirm_password',
    description: 'Confirm password of the user',
    required: true,
    type: String,
    example: 'Abc123!@#',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  @Match('password', { message: 'Password and confirm password do not match' })
  confirm_password: string;
}

export class LoginReqBody {
  @ApiProperty({
    name: 'email',
    description: 'Email of the user',
    required: true,
    type: String,
    example: 'abcxyz@123.co',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    name: 'password',
    description: 'Password of the user',
    required: true,
    type: String,
    example: 'Abc123!@#',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LogoutReqBody {
  @ApiProperty({
    name: 'refresh_token',
    description: 'Refresh token of the user',
    required: true,
    type: String,
    example: 'refresh_token',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

export class RefreshTokenReqBody {
  @ApiProperty({
    name: 'refresh_token',
    description: 'Refresh token of the user',
    required: true,
    type: String,
    example: 'refresh_token',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
