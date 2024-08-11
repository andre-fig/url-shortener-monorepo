import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShortenedUrl } from './entities/shortened-url.entity';
import { CreateShortenedUrlDto } from './dtos/create-shortened-url.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { UpdateShortenedUrlDto } from './dtos/update-shortened-url.dto';

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
    userId?: number,
  ): Promise<{ shortenedUrl: string; user?: User }> {
    let user: User | null = null;

    if (userId) {
      user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }
    }

    let shortCode: string;
    do {
      shortCode = this.generateShortCode();
    } while (
      await this.shortenedUrlRepository.findOne({ where: { shortCode } })
    );

    const shortenedUrlEntity = this.shortenedUrlRepository.create({
      ...createShortenedUrlDto,
      shortCode,
      user,
    });

    await this.shortenedUrlRepository.save(shortenedUrlEntity);

    const shortenedUrl = `${process.env.BASE_URL}/shortened-url/redirect/${shortCode}`;

    return user ? { shortenedUrl, user } : { shortenedUrl };
  }

  async getOriginalUrl(shortCode: string): Promise<string | null> {
    const shortenedUrl = await this.shortenedUrlRepository.findOne({
      where: { shortCode },
    });

    if (!shortenedUrl) {
      return null;
    }

    shortenedUrl.clickCount += 1;
    await this.shortenedUrlRepository.save(shortenedUrl);

    return shortenedUrl.originalUrl;
  }

  public async getUserShortenedUrls(userId: number): Promise<ShortenedUrl[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.shortenedUrlRepository.find({
      where: { user },
      relations: ['user'],
    });
  }

  public async updateShortenedUrl(
    shortCode: string,
    updateShortenedUrlDto: UpdateShortenedUrlDto,
    userId: number,
  ): Promise<ShortenedUrl> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const shortenedUrl = await this.shortenedUrlRepository.findOne({
      where: { shortCode, user },
    });

    if (!shortenedUrl) {
      throw new NotFoundException(
        'URL not found or you do not have permission',
      );
    }

    Object.assign(shortenedUrl, updateShortenedUrlDto);
    return this.shortenedUrlRepository.save(shortenedUrl);
  }

  public async deleteShortenedUrl(
    shortCode: string,
    userId: number,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const shortenedUrl = await this.shortenedUrlRepository.findOne({
      where: { shortCode, user },
    });

    if (!shortenedUrl) {
      throw new NotFoundException(
        'URL not found or you do not have permission',
      );
    }

    await this.shortenedUrlRepository.softRemove(shortenedUrl);
  }

  private generateShortCode(): string {
    return Math.random().toString(36).substring(2, 8);
  }
}
