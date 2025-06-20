import {Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique} from 'typeorm';
import {ProcessSteps} from '../enums/process-steps.enum';
import {Post} from './post.entity';
import {Nullable} from "../types/nullable.type";

@Entity()
@Unique(['uid'])
export class Vote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  uid!: string;

  @Column()
  number!: number;

  @Column()
  applicant!: string;

  @Column('simple-json', {nullable: true})
  amendments!: number[] | null;

  @Column()
  subject!: string;

  @Column()
  totalVotes!: number;

  @Column()
  yesVotes!: number;

  @Column()
  noVotes!: number;

  @Column()
  abstentions!: number;

  @Column()
  date!: Date;

  // Change type to Enum if we migrate from SQLite to Postgres or MySQL
  @Column({
    type: 'text',
    default: ProcessSteps.DOWNLOADED,
  })
  status!: ProcessSteps;

  @Column('text', {nullable: true})
  chatGPTResume!: Nullable<string>;

  @OneToMany(() => Post, (post) => post.vote)
  posts!: Post[];
}
