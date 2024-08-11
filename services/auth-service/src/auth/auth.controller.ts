import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  public async signup(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.authService.registerUser(
      createUserDto.email,
      createUserDto.password,
    );
  }

  @Post('login')
  public async login(@Body() loginUserDto: LoginUserDto): Promise<{
    access_token: { sub: string; exp: number };
  }> {
    return await this.authService.authenticateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
  }
}
