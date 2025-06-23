import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Post } from './app/entities/post.entity';
import { Vote } from './app/entities/vote.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: false,
  logging: false,
  entities: [Post, Vote],
  migrationsRun: false,
  migrations: isProd
    ? ['dist/migrations/*.js']
    : ['src/migrations/*.ts'],
});
