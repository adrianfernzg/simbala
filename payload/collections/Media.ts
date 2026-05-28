import type { CollectionConfig } from 'payload'
import { v2 as cloudinary } from 'cloudinary'
import { readFile, unlink } from 'fs/promises'
import { join } from 'path'

const STATIC_DIR = '/tmp/payload-media'

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

function cloudinaryTransformUrl(publicId: string, transform: string): string {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME
  return `https://res.cloudinary.com/${cloud}/image/upload/${transform}/${publicId}`
}

async function uploadToCloudinary(
  filePath: string,
  mimeType: string,
  filename: string,
): Promise<{ url: string; publicId: string; width?: number; height?: number }> {
  configureCloudinary()
  const buffer = await readFile(filePath)
  const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'payload/media',
    use_filename: true,
    unique_filename: true,
    resource_type: 'image',
    public_id: filename.replace(/\.[^.]+$/, ''),
  })
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  }
}

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: STATIC_DIR,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300 },
      { name: 'card', width: 800, height: 600 },
      { name: 'og', width: 1200, height: 630 },
    ],
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        if (process.env.NODE_ENV !== 'production') return doc
        if (operation !== 'create') return doc

        const filename = doc.filename as string
        const mimeType = (doc.mimeType as string) ?? 'image/jpeg'
        if (!filename) return doc

        const filePath = join(STATIC_DIR, filename)

        try {
          const result = await uploadToCloudinary(filePath, mimeType, filename)

          // Build Cloudinary transformation URLs for image sizes
          const thumbUrl = cloudinaryTransformUrl(result.publicId, 'c_fill,w_400,h_300')
          const cardUrl  = cloudinaryTransformUrl(result.publicId, 'c_fill,w_800,h_600')
          const ogUrl    = cloudinaryTransformUrl(result.publicId, 'c_fill,w_1200,h_630')

          const pool = (req.payload.db as any).pool
          await pool.query(
            `UPDATE payload.media SET
               url = $1,
               cloudinary_public_id = $2,
               sizes_thumbnail_url = $3,
               sizes_card_url = $4,
               sizes_og_url = $5
             WHERE id = $6`,
            [result.url, result.publicId, thumbUrl, cardUrl, ogUrl, doc.id],
          )

          // clean up temp files, non-blocking
          unlink(filePath).catch(() => {})
          unlink(join(STATIC_DIR, filename.replace(/(\.[^.]+)$/, '-400x300$1'))).catch(() => {})
          unlink(join(STATIC_DIR, filename.replace(/(\.[^.]+)$/, '-800x600$1'))).catch(() => {})
          unlink(join(STATIC_DIR, filename.replace(/(\.[^.]+)$/, '-1200x630$1'))).catch(() => {})

          return { ...doc, url: result.url }
        } catch (err) {
          req.payload.logger.error({ err }, 'Cloudinary upload failed')
          return doc
        }
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        if (process.env.NODE_ENV !== 'production') return
        const publicId = (doc as unknown as Record<string, unknown>).cloudinaryPublicId as
          | string
          | undefined
        if (!publicId) return
        try {
          configureCloudinary()
          await cloudinary.uploader.destroy(publicId)
        } catch {
          // non-critical
        }
      },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
    { name: 'cloudinaryPublicId', type: 'text', admin: { hidden: true } },
  ],
}
