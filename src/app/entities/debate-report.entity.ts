import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class DebateReport {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  filename!: string;

  @Column()
  sessionDate!: Date;
}
