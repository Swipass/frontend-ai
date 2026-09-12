// build/seo/crawlerFiles.ts
// The plain files crawlers ask for by name, generated from the page registry.
import { INDEXABLE_PAGES } from '../../src/seo/pages.ts'
import { SITE, absoluteUrl } from '../../src/seo/site.ts'
import { escapeHtml } from './escape.ts'

// No <lastmod>: a build date would claim every page changed on every deploy,
// and search engines stop trusting lastmod once it proves unreliable.
function sitemapXml(): string {
  const urls = INDEXABLE_PAGES.map(
    (page) => `  <url>\n    <loc>${escapeHtml(absoluteUrl(page.path))}</loc>\n  </url>`,
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

// Private routes are not disallowed: they send noindex, and a crawler has to be
// allowed to fetch a page to see that.
function robotsTxt(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`
}

// A plain-text map of the site for language-model crawlers (llmstxt.org).
function llmsTxt(): string {
  const pages = INDEXABLE_PAGES.map((page) => `- [${page.label}](${absoluteUrl(page.path)}): ${page.description}`)
  const links = SITE.sameAs.map((url) => `- [GitHub](${url}): Swipass source repositories`)
  return [`# ${SITE.name}`, '', `> ${SITE.description}`, '', '## Pages', '', ...pages, '', '## Links', '', ...links, ''].join('\n')
}

/** File name in dist/ mapped to its content. */
export function crawlerFiles(): Record<string, string> {
  return {
    'sitemap.xml': sitemapXml(),
    'robots.txt': robotsTxt(),
    'llms.txt': llmsTxt(),
    [`${SITE.indexNowKey}.txt`]: SITE.indexNowKey,
  }
}
