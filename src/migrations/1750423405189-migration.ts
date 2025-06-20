import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1750423405189 implements MigrationInterface {
  name = 'Migration1750423405189';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "vote" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "uid" varchar NOT NULL, "number" integer NOT NULL, "title" varchar NOT NULL, "applicant" varchar NOT NULL, "subject" varchar NOT NULL, "totalVotes" integer NOT NULL, "yesVotes" integer NOT NULL, "noVotes" integer NOT NULL, "abstentions" integer NOT NULL, "date" datetime NOT NULL, "status" text NOT NULL DEFAULT ('file-downloaded'), CONSTRAINT "UQ_91f6ff49fa29244744a54847d1f" UNIQUE ("uid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "text" varchar NOT NULL, "posted" boolean NOT NULL DEFAULT (0), "tweetId" varchar, "voteId" integer)`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "text" varchar NOT NULL, "posted" boolean NOT NULL DEFAULT (0), "tweetId" varchar, "voteId" integer, CONSTRAINT "FK_a6f1ff575d8d9f6e635598de273" FOREIGN KEY ("voteId") REFERENCES "vote" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_post"("id", "text", "posted", "tweetId", "voteId") SELECT "id", "text", "posted", "tweetId", "voteId" FROM "post"`,
    );
    await queryRunner.query(`DROP TABLE "post"`);
    await queryRunner.query(`ALTER TABLE "temporary_post" RENAME TO "post"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "post" RENAME TO "temporary_post"`);
    await queryRunner.query(
      `CREATE TABLE "post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "text" varchar NOT NULL, "posted" boolean NOT NULL DEFAULT (0), "tweetId" varchar, "voteId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "post"("id", "text", "posted", "tweetId", "voteId") SELECT "id", "text", "posted", "tweetId", "voteId" FROM "temporary_post"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_post"`);
    await queryRunner.query(`DROP TABLE "post"`);
    await queryRunner.query(`DROP TABLE "vote"`);
  }
}
