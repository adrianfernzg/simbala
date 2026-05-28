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
    // Run BEFORE the INSERT so the returned data is written to DB directly —
    // avoids the transaction-visibility issue that makes pool.query UPDATE
    // match 0 rows when called from afterChange.
    beforeChange: [
      async ({ data, req, operation }) => {
        if (process.env.NODE_ENV !== 'production') return data
        if (operation !== 'create') return data

        const filename = data.filename as string | undefined
        const mimeType = (data.mimeType as string) ?? 'image/jpeg'
        if (!filename) return data

        const filePath = join(STATIC_DIR, filename)
        req.payload.logger.info({ msg: `[Media] beforeChange: uploading ${filename} to Cloudinary` })

        try {
          const result = await uploadToCloudinary(filePath, mimeType, filename)
          req.payload.logger.info({ msg: `[Media] beforeChange: OK ${result.publicId}` })

          // Delete local files immediately — they are no longer needed.
          unlink(filePath).catch(() => {})
          unlink(join(STATIC_DIR, filename.replace(/(\.[^.]+)$/, '-400x300$1'))).catch(() => {})
          unlink(join(STATIC_DIR, filename.replace(/(\.[^.]+)$/, '-800x600$1'))).catch(() => {})
          unlink(join(STATIC_DIR, filename.replace(/(\.[^.]+)$/, '-1200x630$1'))).catch(() => {})

          // The returned data is what Payload inserts into the DB.
          return {
            ...data,
            url: result.url,
            cloudinaryPublicId: result.publicId,
          }
        } catch (err) {
          req.payload.logger.error({ err, msg: '[Media] beforeChange: Cloudinary upload failed' })
          return data
        }
      },
    ],
    // afterRead: always reconstruct URLs from cloudinaryPublicId when present.
    // Safety net for records that somehow have a wrong url in the DB.
    afterRead: [
      ({ doc }) => {
        const raw = doc as Record<string, unknown>
        const publicId = raw.cloudinaryPublicId as string | undefined
        if (!publicId) return doc
        const cloud = process.env.CLOUDINARY_CLOUD_NAME
        return {
          ...doc,
          url: `https://res.cloudinary.com/${cloud}/image/upload/${publicId}`,
          sizes: {
            thumbnail: {
              url: cloudinaryTransformUrl(publicId, 'c_fill,w_400,h_300'),
              width: 400,
              height: 300,
            },
            card: {
              url: cloudinaryTransformUrl(publicId, 'c_fill,w_800,h_600'),
              width: 800,
              height: 600,
            },
            og: {
              url: cloudinaryTransformUrl(publicId, 'c_fill,w_1200,h_630'),
              width: 1200,
              height: 630,
            },
          },
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
