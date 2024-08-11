import { DataSource } from 'typeorm';
import { ShortenedUrl } from '../shortened-url/entities/shortened-url.entity';
import { User } from '../shortened-url/entities/user.entity';
import { validateEnvVars } from './setup';

validateEnvVars();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [ShortenedUrl, User],
  migrations: ['./dist/migrations/*.js'],
  synchronize: false,
  logging: true,
});
