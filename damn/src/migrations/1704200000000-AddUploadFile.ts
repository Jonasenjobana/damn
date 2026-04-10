export class AddUploadFile1704200000000 {
  public async up(queryRunner: any): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "upload_file" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "original_name" varchar(255),
        "filename" varchar(255),
        "path" varchar(500),
        "mime_type" varchar(100),
        "size" bigint,
        "extension" varchar(20),
        "type" tinyint DEFAULT 1 NOT NULL,
        "status" tinyint DEFAULT 1 NOT NULL,
        "create_time" datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "update_time" datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "is_deleted" tinyint DEFAULT 0 NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_UPLOAD_FILE_ORIGINAL_NAME" ON "upload_file" ("original_name")
    `);
  }

  public async down(queryRunner: any): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "upload_file"`);
  }
}
