import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';

@Entity('shortened_urls')
export class ShortenedUrl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'original_url' })
  originalUrl: string;

  @Column({ unique: true, length: 6, name: 'short_code' })
  shortCode: string;

  @ManyToOne(() => User, (user) => user.shortenedUrls, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user: User;

  @Column({ default: 0, name: 'click_count' })
  clickCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  @Exclude()
  deletedAt: Date;
}
