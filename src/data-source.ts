import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Post } from './app/entities/post.entity';
import { Vote } from './app/entities/vote.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: false,
  logging: false,
  entities: [Post, Vote],
  migrations: ['src/migrations/*.ts'],
});
