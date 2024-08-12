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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UrlShortenerService } from './url-shortener.service';
import { CreateShortenedUrlDto } from './dtos/create-shortened-url.dto';
import { Response } from 'express';
import { User } from './entities/user.entity';
import { UpdateShortenedUrlDto } from './dtos/update-shortened-url.dto';
import { ShortenedUrl } from './entities/shortened-url.entity';
import { GetUserId } from '../common/decorators/get-user-id.decorator';

@ApiTags('URL Shortener')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('shortened-url')
export class UrlShortenerController {
  constructor(private readonly urlShortenerService: UrlShortenerService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a shortened URL' })
  @ApiResponse({
    status: 201,
    description: 'The URL has been successfully shortened.',
  })
  @ApiResponse({ status: 400, description: 'Invalid URL format.' })
  @Post()
  public async shortenUrl(
    @Body() createShortenedUrlDto: CreateShortenedUrlDto,
    @GetUserId({ allowUndefined: true }) userId: number | undefined,
  ): Promise<{ originalUrl: string; shortenedUrl: string; user?: User }> {
    return await this.urlShortenerService.createShortenedUrl(
      createShortenedUrlDto,
      userId,
    );
  }

  @ApiOperation({ summary: 'Redirect to the original URL using a shortcode' })
  @ApiParam({
    name: 'shortCode',
    description: 'The shortcode of the shortened URL',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully redirected to the original URL.',
  })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  @Get('r/:shortCode')
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

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all shortened URLs for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the list of shortened URLs.',
    type: [ShortenedUrl],
  })
  @Get('all')
  public async getUserShortenedUrls(
    @GetUserId() userId: number,
  ): Promise<ShortenedUrl[]> {
    return await this.urlShortenerService.getUserShortenedUrls(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a shortened URL' })
  @ApiParam({
    name: 'shortCode',
    description: 'The shortcode of the shortened URL to update',
    example: 'abc123',
  })
  @ApiBody({ type: UpdateShortenedUrlDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the shortened URL.',
  })
  @ApiResponse({ status: 404, description: 'URL not found.' })
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

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a shortened URL' })
  @ApiParam({
    name: 'shortCode',
    description: 'The shortcode of the shortened URL to delete',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted the shortened URL.',
  })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  @Delete(':shortCode')
  public async deleteShortenedUrl(
    @Param('shortCode') shortCode: string,
    @GetUserId() userId: number,
  ): Promise<void> {
    return await this.urlShortenerService.deleteShortenedUrl(shortCode, userId);
  }
}
