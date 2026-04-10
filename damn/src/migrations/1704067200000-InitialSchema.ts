export class InitialSchema1704067200000 {
  public async up(queryRunner: any): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "username" varchar(50) UNIQUE,
        "password" varchar(255),
        "phone" varchar(11) DEFAULT '' NOT NULL,
        "status" tinyint DEFAULT 1 NOT NULL,
        "is_admin" tinyint DEFAULT 0 NOT NULL,
        "create_time" datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "update_time" datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "is_deleted" tinyint DEFAULT 0 NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_USER_USERNAME" ON "user" ("username")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "article_type" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" varchar(50),
        "sort" integer DEFAULT 0 NOT NULL,
        "status" tinyint DEFAULT 1 NOT NULL,
        "create_time" datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "update_time" datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "is_deleted" tinyint DEFAULT 0 NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_ARTICLE_TYPE_NAME" ON "article_type" ("name")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "article" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "title" varchar(200),
        "content" text,
        "cover" varchar(500) DEFAULT '' NOT NULL,
        "article_type_id" integer,
        "sort" integer DEFAULT 0 NOT NULL,
        "is_pinned" tinyint DEFAULT 0 NOT NULL,
        "is_private" tinyint DEFAULT 0 NOT NULL,
        "status" tinyint DEFAULT 1 NOT NULL,
        "create_time" datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "update_time" datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "is_deleted" tinyint DEFAULT 0 NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_ARTICLE_TITLE" ON "article" ("title")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_ARTICLE_TYPE_ID" ON "article" ("article_type_id")
    `);
  }

  public async down(queryRunner: any): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "article"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "article_type"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
  }
}
