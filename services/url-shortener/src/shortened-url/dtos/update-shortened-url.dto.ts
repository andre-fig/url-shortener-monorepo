import { IsUrl } from 'class-validator';

export class UpdateShortenedUrlDto {
  @IsUrl({}, { message: 'Invalid URL format' })
  originalUrl: string;
}
