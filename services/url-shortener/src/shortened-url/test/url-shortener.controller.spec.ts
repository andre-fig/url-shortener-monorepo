import { Test, TestingModule } from '@nestjs/testing';
import { UrlShortenerController } from '../url-shortener.controller';
import { UrlShortenerService } from '../url-shortener.service';
import { CreateShortenedUrlDto } from '../dtos/create-shortened-url.dto';
import { UpdateShortenedUrlDto } from '../dtos/update-shortened-url.dto';
import { NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { ShortenedUrl } from '../entities/shortened-url.entity';

describe('UrlShortenerController', () => {
  let urlShortenerController: UrlShortenerController;
  let urlShortenerService: UrlShortenerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlShortenerController],
      providers: [
        {
          provide: UrlShortenerService,
          useValue: {
            createShortenedUrl: jest.fn(),
            getOriginalUrl: jest.fn(),
            getUserShortenedUrls: jest.fn(),
            updateShortenedUrl: jest.fn(),
            deleteShortenedUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    urlShortenerController = module.get<UrlShortenerController>(
      UrlShortenerController,
    );
    urlShortenerService = module.get<UrlShortenerService>(UrlShortenerService);
  });

  describe('shortenUrl', () => {
    it('should create a shortened URL', async () => {
      const createShortenedUrlDto: CreateShortenedUrlDto = {
        originalUrl: 'https://example.com',
      };
      const result = {
        originalUrl: 'https://example.com',
        shortenedUrl: 'https://short.ly/abc123',
      };

      jest
        .spyOn(urlShortenerService, 'createShortenedUrl')
        .mockResolvedValue(result);

      const response = await urlShortenerController.shortenUrl(
        createShortenedUrlDto,
        1,
      );

      expect(response).toEqual(result);
      expect(urlShortenerService.createShortenedUrl).toHaveBeenCalledWith(
        createShortenedUrlDto,
        1,
      );
    });
  });

  describe('redirectToOriginal', () => {
    it('should redirect to the original URL', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      const shortCode = 'abc123';
      const originalUrl = 'https://example.com';

      jest
        .spyOn(urlShortenerService, 'getOriginalUrl')
        .mockResolvedValue(originalUrl);

      await urlShortenerController.redirectToOriginal(shortCode, res);

      expect(urlShortenerService.getOriginalUrl).toHaveBeenCalledWith(
        shortCode,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.stringContaining(originalUrl),
      );
    });

    it('should throw a NotFoundException if the URL is not found', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      jest.spyOn(urlShortenerService, 'getOriginalUrl').mockResolvedValue(null);

      await expect(
        urlShortenerController.redirectToOriginal('abc123', res),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserShortenedUrls', () => {
    it('should return the shortened URLs of the user', async () => {
      const userId = 1;
      const shortenedUrls: ShortenedUrl[] = [
        {
          id: 'uuid',
          shortCode: 'abc123',
          originalUrl: 'https://example.com',
          user: null,
          clickCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        } as ShortenedUrl,
      ];

      jest
        .spyOn(urlShortenerService, 'getUserShortenedUrls')
        .mockResolvedValue(shortenedUrls);

      const result = await urlShortenerController.getUserShortenedUrls(userId);

      expect(result).toEqual(shortenedUrls);
      expect(urlShortenerService.getUserShortenedUrls).toHaveBeenCalledWith(
        userId,
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

      const mockUpdatedUrl: ShortenedUrl = {
        id: 'uuid',
        originalUrl: 'https://new-example.com',
        shortCode: shortCode,
        user: null,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const updateSpy = jest
        .spyOn(urlShortenerService, 'updateShortenedUrl')
        .mockResolvedValue(mockUpdatedUrl);

      const result = await urlShortenerController.updateShortenedUrl(
        shortCode,
        updateShortenedUrlDto,
        userId,
      );

      expect(updateSpy).toHaveBeenCalledWith(
        shortCode,
        updateShortenedUrlDto,
        userId,
      );
      expect(result).toEqual({ message: 'Shortened URL updated successfully' });
    });
  });

  describe('deleteShortenedUrl', () => {
    it('should delete the shortened URL', async () => {
      const shortCode = 'abc123';
      const userId = 1;

      const deleteSpy = jest
        .spyOn(urlShortenerService, 'deleteShortenedUrl')
        .mockResolvedValue();

      await urlShortenerController.deleteShortenedUrl(shortCode, userId);

      expect(deleteSpy).toHaveBeenCalledWith(shortCode, userId);
    });
  });
});
