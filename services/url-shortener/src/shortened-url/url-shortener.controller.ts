import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  NotFoundException,
  Res,
  Patch,
  Delete,
} from '@nestjs/common';
import { UrlShortenerService } from './url-shortener.service';
import { CreateShortenedUrlDto } from './dtos/create-shortened-url.dto';
import { Response } from 'express';
import { User } from './entities/user.entity';
import { UpdateShortenedUrlDto } from './dtos/update-shortened-url.dto';
import { ShortenedUrl } from './entities/shortened-url.entity';
import { GetUserId } from '../common/decorators/get-user-id.decorator';

@Controller('shortened-url')
export class UrlShortenerController {
  constructor(private readonly urlShortenerService: UrlShortenerService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  public async shortenUrl(
    @Body() createShortenedUrlDto: CreateShortenedUrlDto,
    @GetUserId() userId: number | undefined,
  ): Promise<{ shortenedUrl: string; user?: User }> {
    return this.urlShortenerService.createShortenedUrl(
      createShortenedUrlDto,
      userId,
    );
  }

  @Get('redirect/:shortCode')
  public async redirectToOriginal(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
  ): Promise<void> {
    const originalUrl =
      await this.urlShortenerService.getOriginalUrl(shortCode);
    if (!originalUrl) {
      throw new NotFoundException('URL not found');
    }
    res.redirect(originalUrl);
  }

  @Get()
  public async getUserShortenedUrls(
    @GetUserId() userId: number,
  ): Promise<ShortenedUrl[]> {
    return this.urlShortenerService.getUserShortenedUrls(userId);
  }

  @Patch(':shortCode')
  public async updateShortenedUrl(
    @Param('shortCode') shortCode: string,
    @Body() updateShortenedUrlDto: UpdateShortenedUrlDto,
    @GetUserId() userId: number,
  ): Promise<{ message: string }> {
    await this.urlShortenerService.updateShortenedUrl(
      shortCode,
      updateShortenedUrlDto,
      userId,
    );
    return { message: 'Shortened URL updated successfully' };
  }

  @Delete(':shortCode')
  public async deleteShortenedUrl(
    @Param('shortCode') shortCode: string,
    @GetUserId() userId: number,
  ) {
    return this.urlShortenerService.deleteShortenedUrl(shortCode, userId);
  }
}
