import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateShortenedUrlDto {
  @IsOptional()
  @IsUrl()
  originalUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(6)
  shortCode?: string;
}
