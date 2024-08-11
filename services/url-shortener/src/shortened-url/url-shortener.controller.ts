import { Controller, Post, Body, Get, Param, Headers, UseInterceptors, ClassSerializerInterceptor, NotFoundException, Res } from '@nestjs/common';
import { UrlShortenerService } from './url-shortener.service';
import { CreateShortenedUrlDto } from './dtos/create-shortened-url.dto';
import { Response } from 'express';
import { User } from './entities/user.entity';

@Controller('shortened-url')
export class UrlShortenerController {
  constructor(private readonly urlShortenerService: UrlShortenerService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  public async shortenUrl(
    @Body() createShortenedUrlDto: CreateShortenedUrlDto,
    @Headers('Authorization') authorization: string,
  ): Promise<{ shortenedUrl: string, user?: User }> {
    return this.urlShortenerService.createShortenedUrl(createShortenedUrlDto, authorization);
  }

  @Get('redirect/:shortCode')
  public async redirectToOriginal(@Param('shortCode') shortCode: string, @Res() res: Response): Promise<void> {
    const originalUrl = await this.urlShortenerService.getOriginalUrl(shortCode);
    if (!originalUrl) {
      throw new NotFoundException('URL not found');
    }
    res.redirect(originalUrl);
  }
}
