// src/seo/headTags.ts
// The <head> tags a page needs, as plain data. The build renders them into each
// route's HTML and useDocumentHead applies the same list on client navigation,
// so what crawlers read and what the browser shows cannot drift apart.
import { SITE, absoluteUrl } from './site.ts'
import { structuredData } from './structuredData.ts'
import type { SeoPage } from './pages.ts'

export interface HeadTag {
  tag: 'meta' | 'link' | 'script'
  attrs: Record<string, string>
  /** Text content; only script tags use it. */
  text?: string
}

export interface PageHead {
  title: string
  tags: HeadTag[]
}

const ROBOTS_INDEX = 'index, follow, max-image-preview:large, max-snippet:-1'
const ROBOTS_NOINDEX = 'noindex, nofollow'

const named = (name: string, content: string): HeadTag => ({ tag: 'meta', attrs: { name, content } })
const property = (prop: string, content: string): HeadTag => ({ tag: 'meta', attrs: { property: prop, content } })

export function pageHead(page: SeoPage): PageHead {
  const image = absoluteUrl(SITE.ogImage.path)
  const tags: HeadTag[] = [
    named('description', page.description),
    named('robots', page.indexable ? ROBOTS_INDEX : ROBOTS_NOINDEX),
    property('og:site_name', SITE.name),
    property('og:type', 'website'),
    property('og:locale', SITE.locale),
    property('og:title', page.title),
    property('og:description', page.description),
    property('og:image', image),
    property('og:image:type', 'image/png'),
    property('og:image:width', String(SITE.ogImage.width)),
    property('og:image:height', String(SITE.ogImage.height)),
    property('og:image:alt', SITE.ogImage.alt),
    named('twitter:card', 'summary_large_image'),
    named('twitter:title', page.title),
    named('twitter:description', page.description),
    named('twitter:image', image),
    named('twitter:image:alt', SITE.ogImage.alt),
  ]

  if (page.indexable) {
    const url = absoluteUrl(page.path)
    tags.push(property('og:url', url), { tag: 'link', attrs: { rel: 'canonical', href: url } })
  }

  const data = structuredData(page)
  if (data) tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, text: JSON.stringify(data) })

  return { title: page.title, tags }
}
