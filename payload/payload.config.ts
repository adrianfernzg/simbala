import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { Products } from './collections/Products'
import { Categories } from './collections/Categories'
import { Orders } from './collections/Orders'
import { BlogPosts } from './collections/BlogPosts'
import { BlogCategories } from './collections/BlogCategories'
import { Users } from './collections/Users'
import { Media } from './collections/Media'

export default buildConfig({
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '— Panel Admin',
    },
  },
  collections: [Users, Products, Categories, Orders, BlogPosts, BlogCategories, Media],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  email: nodemailerAdapter({
    defaultFromAddress: process.env.EMAIL_FROM ?? 'noreply@example.com',
    defaultFromName: 'Recreativas',
    transportOptions: {
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT ?? 587),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    },
  }),
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: 'payload-types.ts',
  },
  localization: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    fallback: true,
  },
})
