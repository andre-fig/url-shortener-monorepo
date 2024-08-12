import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { LoginUserDto } from '../dtos/login-user.dto';
import { User } from '../entities/user.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            registerUser: jest.fn(),
            authenticateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user: User = {
        id: 1,
        email: createUserDto.email,
        password: 'hashedPassword',
      } as User;

      jest.spyOn(authService, 'registerUser').mockResolvedValue(user);

      const result = await authController.signup(createUserDto);

      expect(result).toEqual(user);
      expect(authService.registerUser).toHaveBeenCalledWith(
        createUserDto.email,
        createUserDto.password,
      );
    });

    it('should throw a ConflictException if the email is already in use', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest
        .spyOn(authService, 'registerUser')
        .mockRejectedValue(new ConflictException());

      await expect(authController.signup(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should authenticate a user and return an access token', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const accessToken = { access_token: 'signedToken' };

      jest
        .spyOn(authService, 'authenticateUser')
        .mockResolvedValue(accessToken);

      const result = await authController.login(loginUserDto);

      expect(result).toEqual(accessToken);
      expect(authService.authenticateUser).toHaveBeenCalledWith(
        loginUserDto.email,
        loginUserDto.password,
      );
    });

    it('should throw an UnauthorizedException if credentials are invalid', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      jest
        .spyOn(authService, 'authenticateUser')
        .mockRejectedValue(new UnauthorizedException());

      await expect(authController.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
