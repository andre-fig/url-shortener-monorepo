import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1723308306555 implements MigrationInterface {
    name = 'InitialMigration1723308306555'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP, "deleted_at" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shortened_urls" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "original_url" text NOT NULL, "short_code" character varying(6) NOT NULL, "click_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "userId" integer, CONSTRAINT "UQ_b29a75e93a764e12cd3d0639487" UNIQUE ("short_code"), CONSTRAINT "PK_e8551ecfee7205fafa259dda8d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "shortened_urls" ADD CONSTRAINT "FK_a6ddf97863e5c4fe074fe19cfcb" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shortened_urls" DROP CONSTRAINT "FK_a6ddf97863e5c4fe074fe19cfcb"`);
        await queryRunner.query(`DROP TABLE "shortened_urls"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
