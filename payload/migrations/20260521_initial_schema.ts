import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

// Crea todas las tablas de Payload en producción usando drizzle push.
// Solo se ejecuta una vez (Payload registra el nombre en payload_migrations).
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const adapter = payload.db as any
  const { pushSchema } = adapter.requireDrizzleKit()
  const { apply, warnings } = await pushSchema(
    adapter.schema,
    adapter.drizzle,
    adapter.schemaName ? [adapter.schemaName] : undefined,
  )
  if (warnings?.length > 0) {
    payload.logger.warn({ msg: `Schema push warnings:\n${warnings.join('\n')}` })
  }
  await apply()
}

export async function down(_args: MigrateDownArgs): Promise<void> {}
