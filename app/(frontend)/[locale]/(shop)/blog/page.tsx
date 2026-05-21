import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'es' ? 'Blog' : 'Blog',
    description: locale === 'es'
      ? 'Artículos sobre máquinas recreativas, arcade y cultura retro.'
      : 'Articles about arcade machines and retro gaming culture.',
  }
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  const payload = await getPayload({ config })

  const { docs: posts } = await payload.find({
    collection: 'blog-posts',
    where: { published: { equals: true } },
    sort: '-createdAt',
    limit: 20,
    depth: 1,
    locale: locale as 'es' | 'en',
  })

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="border-b border-border pb-10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Simbala Arcade</p>
        <h1 className="mt-3 text-4xl font-bold text-text-primary">Blog</h1>
        <p className="mt-3 text-sm text-text-secondary">
          Arcade, cultura retro y novedades del taller.
        </p>
      </div>

      {posts.length > 0 ? (
        <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const coverImage = typeof post.coverImage === 'object' ? post.coverImage : null
            const coverUrl = coverImage?.url ?? null
            const category = typeof post.category === 'object' ? post.category : null

            return (
              <li key={post.id}>
                <article className="group flex flex-col overflow-hidden border border-border bg-surface hover:border-gold/40 transition-colors duration-300">
                  <Link href={`/${locale}/blog/${post.slug}`} className="relative aspect-video overflow-hidden bg-surface-raised">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={post.title as string}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-[10px] uppercase tracking-widest text-text-muted">Sin imagen</span>
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-text-muted">
                      {category && <span className="text-gold">{category.name as string}</span>}
                      <span>
                        {new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        }).format(new Date(post.createdAt))}
                      </span>
                    </div>
                    <h2 className="mt-3 text-base font-semibold text-text-primary group-hover:text-gold transition-colors line-clamp-2">
                      <Link href={`/${locale}/blog/${post.slug}`}>{post.title as string}</Link>
                    </h2>
                    {post.excerpt && (
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary line-clamp-3">
                        {post.excerpt as string}
                      </p>
                    )}
                    <div className="mt-auto pt-5">
                      <Link
                        href={`/${locale}/blog/${post.slug}`}
                        className="text-xs uppercase tracking-widest text-gold hover:underline"
                      >
                        {locale === 'es' ? 'Leer más →' : 'Read more →'}
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="mt-20 border border-border py-24 text-center">
          <p className="text-xs uppercase tracking-widest text-text-muted">
            Próximamente — primeros artículos en preparación
          </p>
        </div>
      )}
    </section>
  )
}
