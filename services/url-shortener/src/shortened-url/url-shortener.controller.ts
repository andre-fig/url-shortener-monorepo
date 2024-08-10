import { Controller, Post, Body, Get, Param, Headers, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UrlShortenerService } from './url-shortener.service';
import { CreateShortenedUrlDto } from './dtos/create-shortened-url.dto';
import { ShortenedUrl } from './entities/shortened-url.entity';

@Controller('shortened-url')
export class UrlShortenerController {
  constructor(private readonly urlShortenerService: UrlShortenerService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async shortenUrl(
    @Body() createShortenedUrlDto: CreateShortenedUrlDto,
    @Headers('Authorization') authorization: string,
  ): Promise<ShortenedUrl>  {
    return this.urlShortenerService.createShortenedUrl(createShortenedUrlDto, authorization);
  }

  @Get(':shortCode')
  async redirectToOriginal(@Param('shortCode') shortCode: string): Promise<{ url: string }> {
    const originalUrl = await this.urlShortenerService.getOriginalUrl(shortCode);
    return { url: originalUrl };
  }
}
