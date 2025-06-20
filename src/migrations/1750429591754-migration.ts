import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1750429591754 implements MigrationInterface {
    name = 'Migration1750429591754'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_vote" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "uid" varchar NOT NULL, "number" integer NOT NULL, "applicant" varchar NOT NULL, "subject" varchar NOT NULL, "totalVotes" integer NOT NULL, "yesVotes" integer NOT NULL, "noVotes" integer NOT NULL, "abstentions" integer NOT NULL, "date" datetime NOT NULL, "status" text NOT NULL DEFAULT ('file-downloaded'), "amendments" text, "chatGPTResume" text, CONSTRAINT "UQ_91f6ff49fa29244744a54847d1f" UNIQUE ("uid"))`);
        await queryRunner.query(`INSERT INTO "temporary_vote"("id", "uid", "number", "applicant", "subject", "totalVotes", "yesVotes", "noVotes", "abstentions", "date", "status", "amendments") SELECT "id", "uid", "number", "applicant", "subject", "totalVotes", "yesVotes", "noVotes", "abstentions", "date", "status", "amendments" FROM "vote"`);
        await queryRunner.query(`DROP TABLE "vote"`);
        await queryRunner.query(`ALTER TABLE "temporary_vote" RENAME TO "vote"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote" RENAME TO "temporary_vote"`);
        await queryRunner.query(`CREATE TABLE "vote" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "uid" varchar NOT NULL, "number" integer NOT NULL, "applicant" varchar NOT NULL, "subject" varchar NOT NULL, "totalVotes" integer NOT NULL, "yesVotes" integer NOT NULL, "noVotes" integer NOT NULL, "abstentions" integer NOT NULL, "date" datetime NOT NULL, "status" text NOT NULL DEFAULT ('file-downloaded'), "amendments" text, CONSTRAINT "UQ_91f6ff49fa29244744a54847d1f" UNIQUE ("uid"))`);
        await queryRunner.query(`INSERT INTO "vote"("id", "uid", "number", "applicant", "subject", "totalVotes", "yesVotes", "noVotes", "abstentions", "date", "status", "amendments") SELECT "id", "uid", "number", "applicant", "subject", "totalVotes", "yesVotes", "noVotes", "abstentions", "date", "status", "amendments" FROM "temporary_vote"`);
        await queryRunner.query(`DROP TABLE "temporary_vote"`);
    }

}
