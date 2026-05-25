import { type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

// Añade el campo orderRef a la colección orders usando pushSchema,
// igual que la migración inicial, para que Payload resuelva
// correctamente el schemaName ('payload') de forma automática.
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
