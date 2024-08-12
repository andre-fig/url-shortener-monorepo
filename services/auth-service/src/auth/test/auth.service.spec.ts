import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../entities/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('fakeSalt'),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            decode: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(usersRepository, 'create')
        .mockReturnValue({ email, password } as User);
      jest
        .spyOn(usersRepository, 'save')
        .mockResolvedValue({ id: 1, email } as User);

      const result = await authService.registerUser(email, password);

      expect(result).toEqual({ id: 1, email });
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(password, expect.anything());
    });

    it('should throw a ConflictException if the email is already in use', async () => {
      jest
        .spyOn(usersRepository, 'findOne')
        .mockResolvedValue({ id: 1, email: 'test@example.com' } as User);

      await expect(
        authService.registerUser('test@example.com', 'password123'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate a user and return a JWT token', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = { id: 1, email, password: 'hashedPassword' } as User;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);

      jest.spyOn(jwtService, 'sign').mockReturnValue('signedToken');
      jest.spyOn(jwtService, 'decode').mockReturnValue({ exp: 123456 });

      const accessToken = { access_token: 'signedToken' };

      const result = await authService.authenticateUser(email, password);

      expect(result).toEqual(accessToken);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        iss: 'auth-service',
      });
    });

    it('should throw an UnauthorizedException if credentials are invalid', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      await expect(
        authService.authenticateUser('test@example.com', 'wrongPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUserById', () => {
    it('should return a user if found', async () => {
      const user = { id: 1, email: 'test@example.com' } as User;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);

      const result = await authService.validateUserById(1);

      expect(result).toEqual(user);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null if no user is found', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      const result = await authService.validateUserById(1);

      expect(result).toBeNull();
    });
  });
});
