import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShortenedUrl } from './entities/shortened-url.entity';
import { CreateShortenedUrlDto } from './dtos/create-shortened-url.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';

@Injectable()
export class UrlShortenerService {
  constructor(
    @InjectRepository(ShortenedUrl)
    private readonly shortenedUrlRepository: Repository<ShortenedUrl>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  public async createShortenedUrl(
    createShortenedUrlDto: CreateShortenedUrlDto,
    authorization: string,
  ): Promise<ShortenedUrl> {
    let user: User | null = null;
  
    if (authorization) {
      const token = authorization.replace('Bearer ', '');
      try {
        const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
        user = await this.userRepository.findOne({ where: { id: decoded.sub } });
      } catch (error) {
        throw new UnauthorizedException('Invalid token');
      }
    }
  
    const shortCode = this.generateShortCode();
    const shortenedUrl = this.shortenedUrlRepository.create({
      ...createShortenedUrlDto,
      shortCode,
      user,
    });
  
    return this.shortenedUrlRepository.save(shortenedUrl);
  }
  

  public async getOriginalUrl(shortCode: string): Promise<string> {
    const shortenedUrl = await this.shortenedUrlRepository.findOne({ where: { shortCode } });
    if (!shortenedUrl) {
      throw new NotFoundException('URL not found');
    }

    shortenedUrl.clickCount += 1;
    await this.shortenedUrlRepository.save(shortenedUrl);

    return shortenedUrl.originalUrl;
  }

  private generateShortCode(): string {
    return Math.random().toString(36).substring(2, 8);
  }
}
