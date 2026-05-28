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

  const { docs: posts, totalDocs } = await payload.find({
    collection: 'blog-posts',
    where: { published: { equals: true } },
    sort: '-createdAt',
    limit: 20,
    depth: 1,
    locale: locale as 'es' | 'en',
  })

  const count = String(totalDocs).padStart(2, '0')

  return (
    <>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-0 sm:px-6 lg:px-8">
        <div className="relative pb-10">
          {/* Decorative counter */}
          <div className="absolute top-0 right-0 text-right select-none" aria-hidden="true">
            <p className="font-pixel text-gold-muted" style={{ fontSize: '7px', letterSpacing: '0.2em' }}>
              {locale === 'es' ? 'ARTÍCULOS' : 'ARTICLES'}
            </p>
            <p className="font-arcade text-6xl text-gold glow-gold leading-none mt-1">{count}</p>
          </div>

          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Simbala Arcade</p>
          <h1 className="mt-3 font-arcade text-4xl uppercase text-text-primary">Blog</h1>
          <p className="mt-3 text-sm text-text-secondary max-w-lg">
            {locale === 'es'
              ? 'Arcade, cultura retro y novedades del taller.'
              : 'Arcade culture, retro gaming and workshop news.'}
          </p>
        </div>
        <div className="neon-divider" />
      </div>

      {/* ── Posts grid ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {posts.length > 0 ? (
          <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const coverImage = typeof post.coverImage === 'object' ? post.coverImage : null
              const coverUrl = coverImage?.url ?? null
              const category = typeof post.category === 'object' ? post.category : null

              return (
                <li key={post.id} className="pixel-box pixel-corners">
                  <article className="group flex flex-col overflow-hidden bg-surface h-full">
                    {/* Cover image */}
                    <Link
                      href={`/${locale}/blog/${post.slug}`}
                      className="relative aspect-video overflow-hidden bg-surface-raised block"
                    >
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={post.title as string}
                          fill
                          className="object-cover transition-all duration-500 group-hover:scale-105 opacity-75 group-hover:opacity-100"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <svg className="h-14 w-14 text-gold opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                      {/* Bottom gradient overlay */}
                      <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
                      {/* Category badge on image */}
                      {category && (
                        <div className="absolute top-3 left-3 z-20">
                          <span className="font-pixel bg-gold text-black px-2 py-1" style={{ fontSize: '7px' }}>
                            {(category.name as string).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {/* Read badge on hover */}
                      <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="font-pixel bg-gold text-black px-2 py-1 blink" style={{ fontSize: '7px' }}>
                          {locale === 'es' ? 'LEER' : 'READ'}
                        </span>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-5">
                      {/* Date */}
                      <p className="font-pixel text-text-muted" style={{ fontSize: '7px', letterSpacing: '0.12em' }}>
                        ▸{' '}
                        {new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        }).format(new Date(post.createdAt))}
                      </p>

                      <h2 className="mt-3 font-arcade text-base text-text-primary group-hover:text-gold transition-colors line-clamp-2 leading-snug">
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
                          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold hover:text-gold-light transition-colors font-semibold"
                        >
                          <span className="h-px w-4 bg-gold" />
                          {locale === 'es' ? 'Leer más' : 'Read more'}
                        </Link>
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="pixel-box pixel-corners py-24 text-center">
            <p className="font-pixel text-text-muted" style={{ fontSize: '9px', letterSpacing: '0.1em' }}>
              {locale === 'es' ? 'PRÓXIMAMENTE' : 'COMING SOON'}
            </p>
            <p className="mt-4 text-sm text-text-secondary">
              {locale === 'es' ? 'Primeros artículos en preparación.' : 'First articles coming soon.'}
            </p>
          </div>
        )}
      </section>
    </>
  )
}
