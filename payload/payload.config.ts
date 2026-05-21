import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { es } from '@payloadcms/translations/languages/es'
import { en } from '@payloadcms/translations/languages/en'
import { Products } from './collections/Products'
import { Categories } from './collections/Categories'
import { Orders } from './collections/Orders'
import { BlogPosts } from './collections/BlogPosts'
import { BlogCategories } from './collections/BlogCategories'
import { Users } from './collections/Users'
import { Clientes } from './collections/Clientes'
import { Media } from './collections/Media'

export default buildConfig({
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '— Panel Admin',
    },
  },
  i18n: {
    supportedLanguages: { es, en },
    fallbackLanguage: 'es',
  },
  collections: [Users, Clientes, Products, Categories, Orders, BlogPosts, BlogCategories, Media],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    schemaName: 'payload',
    // En producción sin migraciones previas: PAYLOAD_DB_PUSH=true en Railway (solo primer deploy)
    push: process.env.PAYLOAD_DB_PUSH === 'true',
  }),
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: 'payload-types.ts',
  },
})
