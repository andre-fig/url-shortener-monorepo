import { DataSource } from 'typeorm';
import { ShortenedUrl } from './shortened-url/entities/shortened-url.entity';
import { User } from './shortened-url/entities/user.entity';

function ensureEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not defined`);
  }
  return value;
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: ensureEnvVar('DATABASE_HOST'),
  port: parseInt(ensureEnvVar('DATABASE_PORT'), 10),
  username: ensureEnvVar('DATABASE_USERNAME'),
  password: ensureEnvVar('DATABASE_PASSWORD'),
  database: ensureEnvVar('DATABASE_NAME'),
  entities: [ShortenedUrl, User],
  migrations: ['./dist/migrations/*.js'],
  synchronize: false,
  logging: true,
});
