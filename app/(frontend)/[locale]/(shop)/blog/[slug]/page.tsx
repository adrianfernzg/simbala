import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'blog-posts',
    where: { slug: { equals: slug }, published: { equals: true } },
    limit: 1,
    depth: 0,
    locale: locale as 'es' | 'en',
  })
  const post = docs[0]
  if (!post) return { title: 'Artículo no encontrado' }

  return {
    title: (post.metaTitle as string) || (post.title as string),
    description: (post.metaDesc as string) || (post.excerpt as string) || undefined,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'blog-posts',
    where: { slug: { equals: slug }, published: { equals: true } },
    limit: 1,
    depth: 1,
    locale: locale as 'es' | 'en',
  })

  const post = docs[0]
  if (!post) notFound()

  const coverImage = typeof post.coverImage === 'object' ? post.coverImage : null
  const coverUrl = coverImage?.url ?? null
  const category = typeof post.category === 'object' ? post.category : null

  let contentHtml = ''
  if (post.content && typeof post.content === 'object') {
    try {
      contentHtml = await convertLexicalToHTML({ data: post.content as Parameters<typeof convertLexicalToHTML>[0]['data'] })
    } catch {
      contentHtml = ''
    }
  } else if (typeof post.content === 'string') {
    contentHtml = post.content
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-10 flex items-center gap-2 text-xs text-text-muted">
        <Link href={`/${locale}/blog`} className="uppercase tracking-widest hover:text-gold transition-colors">
          Blog
        </Link>
        <span className="text-border">—</span>
        <span className="uppercase tracking-widest text-text-secondary line-clamp-1">{post.title as string}</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <div className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-text-muted">
          {category && <span className="text-gold">{category.name as string}</span>}
          <span>
            {new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-GB', {
              day: '2-digit', month: 'long', year: 'numeric',
            }).format(new Date(post.createdAt))}
          </span>
        </div>
        <h1 className="text-4xl font-bold leading-tight text-text-primary">{post.title as string}</h1>
        {post.excerpt && (
          <p className="mt-4 text-base leading-relaxed text-text-secondary">{post.excerpt as string}</p>
        )}
      </header>

      {/* Imagen destacada */}
      {coverUrl && (
        <figure className="mb-12 overflow-hidden border border-border">
          <Image
            src={coverUrl}
            alt={post.title as string}
            width={800}
            height={450}
            className="w-full object-cover"
            priority
          />
        </figure>
      )}

      {/* Contenido */}
      {contentHtml ? (
        <div
          className="prose-sm max-w-none leading-relaxed text-text-secondary
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-text-primary [&_h1]:mt-8 [&_h1]:mb-4
            [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-text-primary [&_h2]:mt-6 [&_h2]:mb-3
            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-text-primary [&_h3]:mt-5 [&_h3]:mb-2
            [&_p]:mb-4 [&_p]:leading-relaxed
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4
            [&_strong]:text-text-primary [&_strong]:font-semibold
            [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2
            [&_blockquote]:border-l-2 [&_blockquote]:border-gold [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-text-muted"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      ) : null}

      {/* Footer */}
      <footer className="mt-16 border-t border-border pt-8">
        <Link
          href={`/${locale}/blog`}
          className="text-xs uppercase tracking-widest text-text-muted hover:text-gold transition-colors"
        >
          ← {locale === 'es' ? 'Volver al blog' : 'Back to blog'}
        </Link>
      </footer>
    </article>
  )
}
