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
): Promise<{ url: string; publicId: string }> {
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
  return { url: result.secure_url, publicId: result.public_id }
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

        // Capture dependencies before deferring — req may not be safe to
        // access after the response is sent.
        const pool = (req.payload.db as any).pool
        const logger = req.payload.logger

        logger.info({ msg: `[Media] scheduling Cloudinary upload for ${filename}` })

        // Defer to the next event-loop tick so Payload's INSERT transaction
        // has committed before we run the UPDATE. pool.query opens a fresh
        // connection (READ COMMITTED) and would match 0 rows if the INSERT
        // were still uncommitted.
        setImmediate(async () => {
          try {
            const result = await uploadToCloudinary(filePath, mimeType, filename)
            logger.info({ msg: `[Media] Cloudinary OK: ${result.publicId}` })

            const dbResult = await pool.query(
              `UPDATE payload.media SET url = $1, cloudinary_public_id = $2 WHERE filename = $3`,
              [result.url, result.publicId, filename],
            )
            logger.info({
              msg: `[Media] DB update: ${dbResult.rowCount} row(s) for filename=${filename}`,
            })

            if (dbResult.rowCount > 0) {
              // Clean up local files only after confirming the DB was updated
              unlink(filePath).catch(() => {})
              unlink(join(STATIC_DIR, filename.replace(/(\.[^.]+)$/, '-400x300$1'))).catch(() => {})
              unlink(join(STATIC_DIR, filename.replace(/(\.[^.]+)$/, '-800x600$1'))).catch(() => {})
              unlink(join(STATIC_DIR, filename.replace(/(\.[^.]+)$/, '-1200x630$1'))).catch(() => {})
            } else {
              logger.warn({ msg: `[Media] UPDATE matched 0 rows — transaction may not be committed yet. Will not delete local files.` })
            }
          } catch (err) {
            logger.error({ err, msg: `[Media] upload/update failed for ${filename}` })
          }
        })

        return doc
      },
    ],
    // Reconstruct all URLs from cloudinaryPublicId on every read so admin
    // panel and frontend always get Cloudinary URLs.
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
