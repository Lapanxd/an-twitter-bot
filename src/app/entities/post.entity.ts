import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Vote } from './vote.entity';
import { Nullable } from '../types/nullable.type';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  text!: string;

  @Column({ default: false })
  posted!: boolean;

  @Column({
    type: 'text',
    nullable: true,
    default: null,
  })
  tweetId!: Nullable<string>;

  @ManyToOne(() => Vote, (vote) => vote.posts, { onDelete: 'CASCADE' })
  vote!: Vote;
}
