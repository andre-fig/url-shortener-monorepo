import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShortenedUrl } from './entities/shortened-url.entity';
import { CreateShortenedUrlDto } from './dtos/create-shortened-url.dto';
import { User } from './entities/user.entity';
import { UpdateShortenedUrlDto } from './dtos/update-shortened-url.dto';

@Injectable()
export class UrlShortenerService {
  constructor(
    @InjectRepository(ShortenedUrl)
    private readonly shortenedUrlRepository: Repository<ShortenedUrl>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async createShortenedUrl(
    createShortenedUrlDto: CreateShortenedUrlDto,
    userId?: number,
  ): Promise<{ originalUrl: string; shortenedUrl: string; user?: User }> {
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

    const normalizedUrl = this.normalizeUrl(createShortenedUrlDto.originalUrl);

    const shortenedUrlEntity = this.shortenedUrlRepository.create({
      originalUrl: normalizedUrl,
      shortCode,
      user,
    });

    await this.shortenedUrlRepository.save(shortenedUrlEntity);

    const baseUrl = process.env.BASE_URL?.trim();
    const formattedBaseUrl = baseUrl.replace(/\/?$/, '');
    const shortenedUrl = `${formattedBaseUrl}/shortened-url/${shortCode}`;

    return user
      ? { originalUrl: normalizedUrl, shortenedUrl, user }
      : { originalUrl: normalizedUrl, shortenedUrl };
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

    const normalizedUrl = this.normalizeUrl(shortenedUrl.originalUrl);

    return normalizedUrl;
  }

  public async getUserShortenedUrls(userId: number): Promise<ShortenedUrl[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return await this.shortenedUrlRepository.find({
      where: { user: { id: userId } },
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
      where: { shortCode, user: { id: userId } },
    });

    if (!shortenedUrl) {
      throw new NotFoundException(
        'URL not found or you do not have permission',
      );
    }

    const normalizedUrl = this.normalizeUrl(updateShortenedUrlDto.originalUrl);

    Object.assign(shortenedUrl, { originalUrl: normalizedUrl });
    return await this.shortenedUrlRepository.save(shortenedUrl);
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
      where: { shortCode, user: { id: userId } },
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

  private normalizeUrl(url: string): string {
    const trimmedUrl = url.trim();

    const hasValidProtocol =
      trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://');

    return hasValidProtocol ? trimmedUrl : `http://${trimmedUrl}`;
  }
}
