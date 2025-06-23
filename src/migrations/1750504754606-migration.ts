import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1750504754606 implements MigrationInterface {
  name = 'Migration1750504754606';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "text" varchar NOT NULL, "posted" boolean NOT NULL DEFAULT (0), "tweetId" varchar, "voteId" integer, CONSTRAINT "FK_a6f1ff575d8d9f6e635598de273" FOREIGN KEY ("voteId") REFERENCES "vote" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_post"("id", "text", "posted", "tweetId", "voteId") SELECT "id", "text", "posted", "tweetId", "voteId" FROM "post"`,
    );
    await queryRunner.query(`DROP TABLE "post"`);
    await queryRunner.query(`ALTER TABLE "temporary_post" RENAME TO "post"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "text" varchar NOT NULL, "posted" boolean NOT NULL DEFAULT (0), "tweetId" text, "voteId" integer, CONSTRAINT "FK_a6f1ff575d8d9f6e635598de273" FOREIGN KEY ("voteId") REFERENCES "vote" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
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
      `CREATE TABLE "post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "text" varchar NOT NULL, "posted" boolean NOT NULL DEFAULT (0), "tweetId" varchar, "voteId" integer, CONSTRAINT "FK_a6f1ff575d8d9f6e635598de273" FOREIGN KEY ("voteId") REFERENCES "vote" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "post"("id", "text", "posted", "tweetId", "voteId") SELECT "id", "text", "posted", "tweetId", "voteId" FROM "temporary_post"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_post"`);
    await queryRunner.query(`ALTER TABLE "post" RENAME TO "temporary_post"`);
    await queryRunner.query(
      `CREATE TABLE "post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "text" varchar NOT NULL, "posted" boolean NOT NULL DEFAULT (0), "tweetId" varchar, "voteId" integer, CONSTRAINT "FK_a6f1ff575d8d9f6e635598de273" FOREIGN KEY ("voteId") REFERENCES "vote" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "post"("id", "text", "posted", "tweetId", "voteId") SELECT "id", "text", "posted", "tweetId", "voteId" FROM "temporary_post"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_post"`);
  }
}
