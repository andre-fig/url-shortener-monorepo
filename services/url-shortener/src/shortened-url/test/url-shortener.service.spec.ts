import { Test, TestingModule } from '@nestjs/testing';
import { UrlShortenerService } from '../url-shortener.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShortenedUrl } from '../entities/shortened-url.entity';
import { User } from '../entities/user.entity';
import { CreateShortenedUrlDto } from '../dtos/create-shortened-url.dto';
import { UpdateShortenedUrlDto } from '../dtos/update-shortened-url.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('UrlShortenerService', () => {
  let urlShortenerService: UrlShortenerService;
  let shortenedUrlRepository: Repository<ShortenedUrl>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlShortenerService,
        {
          provide: getRepositoryToken(ShortenedUrl),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    urlShortenerService = module.get<UrlShortenerService>(UrlShortenerService);
    shortenedUrlRepository = module.get<Repository<ShortenedUrl>>(
      getRepositoryToken(ShortenedUrl),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('createShortenedUrl', () => {
    it('should create a shortened URL without a user', async () => {
      const createShortenedUrlDto: CreateShortenedUrlDto = {
        originalUrl: 'https://example.com',
      };

      jest.spyOn(shortenedUrlRepository, 'findOne').mockResolvedValueOnce(null);

      const mockShortenedUrl: ShortenedUrl = {
        id: 'uuid',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        user: null,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest
        .spyOn(shortenedUrlRepository, 'create')
        .mockReturnValue(mockShortenedUrl);
      jest
        .spyOn(shortenedUrlRepository, 'save')
        .mockResolvedValue(mockShortenedUrl);

      process.env.BASE_URL = 'http://localhost:3000/';

      const result = await urlShortenerService.createShortenedUrl(
        createShortenedUrlDto,
      );

      expect(result).toEqual({
        originalUrl: 'https://example.com',
        shortenedUrl: expect.stringContaining(
          'http://localhost:3000/shortened-url/',
        ),
      });
      expect(shortenedUrlRepository.create).toHaveBeenCalledWith({
        originalUrl: 'https://example.com',
        shortCode: expect.stringMatching(/^[a-z0-9]{6}$/),
        user: null,
      });
      expect(shortenedUrlRepository.save).toHaveBeenCalledWith(
        mockShortenedUrl,
      );
    });

    it('should create a shortened URL with a user', async () => {
      const createShortenedUrlDto: CreateShortenedUrlDto = {
        originalUrl: 'https://example.com',
      };

      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        shortenedUrls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(shortenedUrlRepository, 'findOne').mockResolvedValueOnce(null);

      const mockShortenedUrl: ShortenedUrl = {
        id: 'uuid',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        user: mockUser,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest
        .spyOn(shortenedUrlRepository, 'create')
        .mockReturnValue(mockShortenedUrl);
      jest
        .spyOn(shortenedUrlRepository, 'save')
        .mockResolvedValue(mockShortenedUrl);

      process.env.BASE_URL = 'http://localhost:3000/';

      const result = await urlShortenerService.createShortenedUrl(
        createShortenedUrlDto,
        mockUser.id,
      );

      expect(result).toEqual({
        originalUrl: 'https://example.com',
        shortenedUrl: expect.stringContaining(
          'http://localhost:3000/shortened-url/',
        ),
        user: mockUser,
      });
      expect(shortenedUrlRepository.create).toHaveBeenCalledWith({
        originalUrl: 'https://example.com',
        shortCode: expect.stringMatching(/^[a-z0-9]{6}$/),
        user: mockUser,
      });
      expect(shortenedUrlRepository.save).toHaveBeenCalledWith(
        mockShortenedUrl,
      );
    });

    it('should create a shortened URL with a base URL that does not end with a slash', async () => {
      const createShortenedUrlDto: CreateShortenedUrlDto = {
        originalUrl: 'https://example.com',
      };

      jest.spyOn(shortenedUrlRepository, 'findOne').mockResolvedValueOnce(null);

      const mockShortenedUrl: ShortenedUrl = {
        id: 'uuid',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        user: null,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest
        .spyOn(shortenedUrlRepository, 'create')
        .mockReturnValue(mockShortenedUrl);
      jest
        .spyOn(shortenedUrlRepository, 'save')
        .mockResolvedValue(mockShortenedUrl);

      process.env.BASE_URL = 'http://localhost:3000';

      const result = await urlShortenerService.createShortenedUrl(
        createShortenedUrlDto,
      );

      expect(result).toEqual({
        originalUrl: 'https://example.com',
        shortenedUrl: expect.stringContaining(
          'http://localhost:3000/shortened-url/',
        ),
      });
      expect(shortenedUrlRepository.create).toHaveBeenCalledWith({
        originalUrl: 'https://example.com',
        shortCode: expect.stringMatching(/^[a-z0-9]{6}$/),
        user: null,
      });
      expect(shortenedUrlRepository.save).toHaveBeenCalledWith(
        mockShortenedUrl,
      );
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const createShortenedUrlDto: CreateShortenedUrlDto = {
        originalUrl: 'https://example.com',
      };

      await expect(
        urlShortenerService.createShortenedUrl(createShortenedUrlDto, 1),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getOriginalUrl', () => {
    it('should return the original URL and increment click count', async () => {
      const shortCode = 'abc123';
      const mockShortenedUrl: ShortenedUrl = {
        id: 'uuid',
        originalUrl: 'https://example.com',
        shortCode,
        user: null,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest
        .spyOn(shortenedUrlRepository, 'findOne')
        .mockResolvedValue(mockShortenedUrl);
      jest
        .spyOn(shortenedUrlRepository, 'save')
        .mockResolvedValue(mockShortenedUrl);

      const result = await urlShortenerService.getOriginalUrl(shortCode);

      expect(result).toBe('https://example.com');
      expect(mockShortenedUrl.clickCount).toBe(1);
      expect(shortenedUrlRepository.save).toHaveBeenCalledWith(
        mockShortenedUrl,
      );
    });

    it('should return null if URL is not found', async () => {
      jest.spyOn(shortenedUrlRepository, 'findOne').mockResolvedValue(null);

      const result = await urlShortenerService.getOriginalUrl('invalidCode');

      expect(result).toBeNull();
    });
  });

  describe('getUserShortenedUrls', () => {
    it('should return shortened URLs for the user', async () => {
      const userId = 1;
      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        password: 'hashedPassword',
        shortenedUrls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const mockShortenedUrls: ShortenedUrl[] = [
        {
          id: 'uuid',
          originalUrl: 'https://example.com',
          shortCode: 'abc123',
          user: mockUser,
          clickCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(shortenedUrlRepository, 'find')
        .mockResolvedValue(mockShortenedUrls);

      const result = await urlShortenerService.getUserShortenedUrls(userId);

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'uuid',
            originalUrl: 'https://example.com',
            shortCode: 'abc123',
            user: mockUser,
            clickCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            shortenedUrl: expect.stringContaining('abc123'),
          }),
        ]),
      );

      expect(shortenedUrlRepository.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
      });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(urlShortenerService.getUserShortenedUrls(1)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('updateShortenedUrl', () => {
    it('should update the shortened URL', async () => {
      const shortCode = 'abc123';
      const updateShortenedUrlDto: UpdateShortenedUrlDto = {
        originalUrl: 'https://new-example.com',
      };
      const userId = 1;

      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        password: 'hashedPassword',
        shortenedUrls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const mockShortenedUrl: ShortenedUrl = {
        id: 'uuid',
        originalUrl: 'https://example.com',
        shortCode,
        user: mockUser,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(shortenedUrlRepository, 'findOne')
        .mockResolvedValue(mockShortenedUrl);
      jest
        .spyOn(shortenedUrlRepository, 'save')
        .mockResolvedValue(mockShortenedUrl);

      const result = await urlShortenerService.updateShortenedUrl(
        shortCode,
        updateShortenedUrlDto,
        userId,
      );

      expect(result).toEqual(mockShortenedUrl);
      expect(shortenedUrlRepository.save).toHaveBeenCalledWith(
        mockShortenedUrl,
      );
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        urlShortenerService.updateShortenedUrl(
          'abc123',
          { originalUrl: 'https://new-example.com' },
          1,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if URL is not found or unauthorized', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        shortenedUrls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      jest.spyOn(shortenedUrlRepository, 'findOne').mockResolvedValue(null);

      await expect(
        urlShortenerService.updateShortenedUrl(
          'abc123',
          { originalUrl: 'https://new-example.com' },
          1,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteShortenedUrl', () => {
    it('should delete the shortened URL', async () => {
      const shortCode = 'abc123';
      const userId = 1;

      const mockUser: User = {
        id: userId,
        email: 'test@example.com',
        password: 'hashedPassword',
        shortenedUrls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const mockShortenedUrl: ShortenedUrl = {
        id: 'uuid',
        originalUrl: 'https://example.com',
        shortCode,
        user: mockUser,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(shortenedUrlRepository, 'findOne')
        .mockResolvedValue(mockShortenedUrl);
      const softRemoveSpy = jest
        .spyOn(shortenedUrlRepository, 'softRemove')
        .mockResolvedValue(mockShortenedUrl);

      await urlShortenerService.deleteShortenedUrl(shortCode, userId);

      expect(softRemoveSpy).toHaveBeenCalledWith(mockShortenedUrl);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        urlShortenerService.deleteShortenedUrl('abc123', 1),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if URL is not found or unauthorized', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        shortenedUrls: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      jest.spyOn(shortenedUrlRepository, 'findOne').mockResolvedValue(null);

      await expect(
        urlShortenerService.deleteShortenedUrl('abc123', 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('normalizeUrl', () => {
    it('should add "http://" prefix if no protocol is present', () => {
      const url = 'example.com';
      const result = urlShortenerService['normalizeUrl'](url);
      expect(result).toBe('http://example.com');
    });

    it('should not modify the URL if it already has a valid protocol', () => {
      const url = 'https://example.com';
      const result = urlShortenerService['normalizeUrl'](url);
      expect(result).toBe('https://example.com');
    });
  });
});
