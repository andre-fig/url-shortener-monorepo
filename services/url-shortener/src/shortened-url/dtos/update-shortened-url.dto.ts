import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class UpdateShortenedUrlDto {
  @ApiProperty({
    description: 'The updated original URL that needs to be shortened',
    example: 'https://www.example.com/updated/url',
  })
  @IsUrl({}, { message: 'Invalid URL format' })
  originalUrl: string;
}
