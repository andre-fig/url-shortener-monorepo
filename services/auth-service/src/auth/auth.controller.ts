import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered.',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  public async signup(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.authService.registerUser(
      createUserDto.email,
      createUserDto.password,
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in an existing user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully authenticated.',
    schema: {
      example: {
        access_token: {
          sub: '1234567890',
          exp: 1699999999,
        },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials.',
  })
  public async login(@Body() loginUserDto: LoginUserDto): Promise<{
    access_token: string;
  }> {
    return await this.authService.authenticateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
  }
}
