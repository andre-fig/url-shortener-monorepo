import { IsUrl } from 'class-validator';

export class CreateShortenedUrlDto {
  @IsUrl({}, { message: 'Invalid URL format' })
  originalUrl: string;
}
