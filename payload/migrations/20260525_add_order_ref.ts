import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Añade la columna order_ref (varchar 10, unique, nullable) a la tabla orders.
// Nullable para no romper pedidos existentes creados antes de este campo.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_ref varchar(10) UNIQUE`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE orders DROP COLUMN IF EXISTS order_ref`)
}
