import { buildConfig } from 'payload'
import sharp from 'sharp'
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
import * as initialSchema from './migrations/20260521_initial_schema'
import * as addOrderRef from './migrations/20260525_add_order_ref'
import * as addCloudinaryPublicId from './migrations/20260527_add_cloudinary_public_id'
import * as fixProductsImagesCascade from './migrations/20260528_fix_products_images_cascade'
import * as addCoverImageToProducts from './migrations/20260528_add_cover_image_to_products'

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_APP_URL ?? '',
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
    push: process.env.NODE_ENV !== 'production',
    prodMigrations: [
      { ...initialSchema, name: '20260521_initial_schema' },
      { ...addOrderRef, name: '20260525_add_order_ref' },
      { ...addCloudinaryPublicId, name: '20260527_add_cloudinary_public_id' },
      { ...fixProductsImagesCascade, name: '20260528_fix_products_images_cascade' },
      { ...addCoverImageToProducts, name: '20260528_add_cover_image_to_products' },
    ],
  }),
  sharp,
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: 'payload-types.ts',
  },
})
