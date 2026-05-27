import { v2 as cloudinary } from 'cloudinary'
import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const cloudinaryAdapter = (): Adapter =>
  ({ collection }) => ({
    name: 'cloudinary',

    handleUpload: async ({ data, file }) => {
      const dataUri = `data:${file.mimeType};base64,${file.buffer.toString('base64')}`

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: `payload/${collection.slug}`,
        use_filename: true,
        unique_filename: true,
        resource_type: 'image',
      })

      return {
        ...data,
        url: result.secure_url,
        filename: result.public_id.split('/').pop() + '.' + result.format,
        cloudinaryPublicId: result.public_id,
        width: result.width,
        height: result.height,
      }
    },

    handleDelete: async ({ doc }) => {
      const publicId = (doc as unknown as Record<string, unknown>).cloudinaryPublicId as string | undefined
      if (publicId) {
        await cloudinary.uploader.destroy(publicId)
      }
    },

    generateURL: ({ filename, prefix }) => {
      const folder = `payload/${prefix ?? 'media'}`
      const publicId = `${folder}/${filename.replace(/\.[^.]+$/, '')}`
      return cloudinary.url(publicId)
    },

    staticHandler: async (_req, { params }) => {
      const folder = `payload/${params.prefix ?? params.collection}`
      const publicId = `${folder}/${params.filename.replace(/\.[^.]+$/, '')}`
      const url = cloudinary.url(publicId)
      return Response.redirect(url, 302)
    },
  })
