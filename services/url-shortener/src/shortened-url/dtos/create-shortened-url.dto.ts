import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class CreateShortenedUrlDto {
  @ApiProperty({
    description: 'The original URL that needs to be shortened',
    example: 'https://www.example.com/some/long/url',
  })
  @IsUrl({}, { message: 'Invalid URL format' })
  originalUrl: string;
}
