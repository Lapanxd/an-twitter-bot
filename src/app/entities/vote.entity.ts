import {Column, Entity, Index, OneToMany, PrimaryGeneratedColumn, Unique} from 'typeorm';
import {ProcessSteps} from '../enums/process-steps.enum';
import {Post} from './post.entity';
import {Nullable} from "../types/nullable.type";
import {PoliticalThemesEnum} from "../enums/political-themes.enum";
import {AmendmentImportance} from "../enums/amendment-importance.enum";

@Entity()
@Unique(['uid'])
export class Vote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index()
  uid!: string;

  @Column()
  @Index()
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

  // Change type to Enum if we migrate from SQLite to Postgres or MySQL
  @Column({
    type: 'text',
    nullable: true
  })
  politicalTheme!: Nullable<PoliticalThemesEnum>;

  // Change type to Enum if we migrate from SQLite to Postgres or MySQL
  @Column({
    type: 'text',
    nullable: true
  })
  amendmentImportance!: Nullable<AmendmentImportance>;

  @Column('text', {nullable: true})
  chatGPTResume!: Nullable<string>;

  @OneToMany(() => Post, (post) => post.vote)
  posts!: Post[];
}
