import { IsUrl, IsOptional } from 'class-validator';

export class CreateShortenedUrlDto {
  @IsUrl({}, { message: 'Invalid URL format' })
  originalUrl: string;

  @IsOptional()
  userId?: number;
}
