import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Vote } from './vote.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  text!: string;

  @Column({ default: false })
  posted!: boolean;

  @Column({ nullable: true })
  tweetId!: string;

  @ManyToOne(() => Vote, (vote) => vote.posts, { onDelete: 'CASCADE' })
  vote!: Vote[];
}
