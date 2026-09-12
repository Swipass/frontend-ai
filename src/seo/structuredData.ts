// src/seo/structuredData.ts
// schema.org JSON-LD for each page, built only from facts the page shows.
import { FAQS } from '../content/faq.ts'
import { SITE, absoluteUrl } from './site.ts'
import type { SchemaBlock, SeoPage } from './pages.ts'

type JsonLdNode = Record<string, unknown>

const ORGANIZATION_ID = `${SITE.origin}/#organization`
const WEBSITE_ID = `${SITE.origin}/#website`

const organization = (): JsonLdNode => ({
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE.name,
  url: absoluteUrl('/'),
  logo: absoluteUrl(SITE.logoPath),
  sameAs: SITE.sameAs,
})

const website = (): JsonLdNode => ({
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE.name,
  url: absoluteUrl('/'),
  description: SITE.description,
  inLanguage: 'en',
  publisher: { '@id': ORGANIZATION_ID },
})

const BLOCKS: Record<SchemaBlock, (page: SeoPage) => JsonLdNode> = {
  webApplication: () => ({
    '@type': 'WebApplication',
    '@id': `${SITE.origin}/#app`,
    name: SITE.name,
    url: absoluteUrl('/app'),
    description: SITE.description,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript and a browser or mobile crypto wallet.',
    publisher: { '@id': ORGANIZATION_ID },
  }),
  faq: () => ({
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }),
  techArticle: (page) => ({
    '@type': 'TechArticle',
    headline: page.heading,
    description: page.description,
    url: absoluteUrl(page.path),
    inLanguage: 'en',
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
  }),
  breadcrumbs: (page) => ({
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE.name, item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: page.label, item: absoluteUrl(page.path) },
    ],
  }),
}

/** The JSON-LD document for a page, or null for pages kept out of search. */
export function structuredData(page: SeoPage): JsonLdNode | null {
  if (!page.indexable) return null
  return {
    '@context': 'https://schema.org',
    '@graph': [organization(), website(), ...(page.schema ?? []).map((block) => BLOCKS[block](page))],
  }
}
