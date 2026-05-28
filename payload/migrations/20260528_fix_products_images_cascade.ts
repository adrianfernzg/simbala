import { type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const adapter = payload.db as any
  const pool = adapter.pool

  // Drop the existing FK constraint and re-add it with ON DELETE CASCADE,
  // plus allow NULL so Payload can unlink media from products without errors.
  await pool.query(`
    ALTER TABLE payload.products_images
      DROP CONSTRAINT IF EXISTS products_images_image_id_media_id_fk;

    ALTER TABLE payload.products_images
      ALTER COLUMN image_id DROP NOT NULL;

    ALTER TABLE payload.products_images
      ADD CONSTRAINT products_images_image_id_media_id_fk
        FOREIGN KEY (image_id)
        REFERENCES payload.media(id)
        ON DELETE SET NULL;
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {}
