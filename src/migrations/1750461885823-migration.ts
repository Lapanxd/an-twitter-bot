import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1750461885823 implements MigrationInterface {
  name = 'Migration1750461885823';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_27c38eb184ec778efc4cf55e91"`);
    await queryRunner.query(`DROP INDEX "IDX_91f6ff49fa29244744a54847d1"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_vote" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "uid" varchar NOT NULL, "number" integer NOT NULL, "applicant" varchar NOT NULL, "subject" varchar NOT NULL, "totalVotes" integer NOT NULL, "yesVotes" integer NOT NULL, "noVotes" integer NOT NULL, "abstentions" integer NOT NULL, "date" datetime NOT NULL, "status" text NOT NULL DEFAULT ('file-downloaded'), "amendments" text, "chatGPTResume" text, "politicalTheme" text, "amendmentImportance" text, CONSTRAINT "UQ_91f6ff49fa29244744a54847d1f" UNIQUE ("uid"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_vote"("id", "uid", "number", "applicant", "subject", "totalVotes", "yesVotes", "noVotes", "abstentions", "date", "status", "amendments", "chatGPTResume", "politicalTheme") SELECT "id", "uid", "number", "applicant", "subject", "totalVotes", "yesVotes", "noVotes", "abstentions", "date", "status", "amendments", "chatGPTResume", "politicalTheme" FROM "vote"`,
    );
    await queryRunner.query(`DROP TABLE "vote"`);
    await queryRunner.query(`ALTER TABLE "temporary_vote" RENAME TO "vote"`);
    await queryRunner.query(`CREATE INDEX "IDX_27c38eb184ec778efc4cf55e91" ON "vote" ("number") `);
    await queryRunner.query(`CREATE INDEX "IDX_91f6ff49fa29244744a54847d1" ON "vote" ("uid") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_91f6ff49fa29244744a54847d1"`);
    await queryRunner.query(`DROP INDEX "IDX_27c38eb184ec778efc4cf55e91"`);
    await queryRunner.query(`ALTER TABLE "vote" RENAME TO "temporary_vote"`);
    await queryRunner.query(
      `CREATE TABLE "vote" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "uid" varchar NOT NULL, "number" integer NOT NULL, "applicant" varchar NOT NULL, "subject" varchar NOT NULL, "totalVotes" integer NOT NULL, "yesVotes" integer NOT NULL, "noVotes" integer NOT NULL, "abstentions" integer NOT NULL, "date" datetime NOT NULL, "status" text NOT NULL DEFAULT ('file-downloaded'), "amendments" text, "chatGPTResume" text, "politicalTheme" text, CONSTRAINT "UQ_91f6ff49fa29244744a54847d1f" UNIQUE ("uid"))`,
    );
    await queryRunner.query(
      `INSERT INTO "vote"("id", "uid", "number", "applicant", "subject", "totalVotes", "yesVotes", "noVotes", "abstentions", "date", "status", "amendments", "chatGPTResume", "politicalTheme") SELECT "id", "uid", "number", "applicant", "subject", "totalVotes", "yesVotes", "noVotes", "abstentions", "date", "status", "amendments", "chatGPTResume", "politicalTheme" FROM "temporary_vote"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_vote"`);
    await queryRunner.query(`CREATE INDEX "IDX_91f6ff49fa29244744a54847d1" ON "vote" ("uid") `);
    await queryRunner.query(`CREATE INDEX "IDX_27c38eb184ec778efc4cf55e91" ON "vote" ("number") `);
  }
}
