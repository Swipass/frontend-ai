// build/seo/validate.ts
// Fails the build when the emitted search files are wrong, so a broken
// sitemap or a stray noindex can never reach production quietly.
import fs from 'node:fs'
import path from 'node:path'
import { INDEXABLE_PAGES, NOT_FOUND_PAGE, PAGES, type SeoPage } from '../../src/seo/pages.ts'
import { SITE, absoluteUrl } from '../../src/seo/site.ts'
import { BODY_SLOT, HEAD_SLOT } from './html.ts'

function read(outDir: string, file: string): string | null {
  const target = path.join(outDir, file)
  return fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null
}

const metaContent = (html: string, name: string): string | undefined =>
  html.match(new RegExp(`<meta[^>]*name="${name}"[^>]*content="([^"]*)"`))?.[1]

function checkPage(html: string, page: SeoPage, problems: string[]): void {
  const where = page.file
  if (!html.match(/<title>([^<]+)<\/title>/)) problems.push(`${where}: empty <title>`)
  if (!metaContent(html, 'description')) problems.push(`${where}: no meta description`)
  if (html.includes(HEAD_SLOT) || html.includes(BODY_SLOT)) problems.push(`${where}: an SEO slot was not filled`)

  const robots = metaContent(html, 'robots') ?? ''
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/)?.[1]
  if (page.indexable) {
    const expected = absoluteUrl(page.path)
    if (robots.includes('noindex')) problems.push(`${where}: public page is marked noindex`)
    if (canonical !== expected) problems.push(`${where}: canonical is ${canonical ?? 'missing'}, expected ${expected}`)
    if (!/<h1[\s>]/.test(html)) problems.push(`${where}: no <h1> in the crawler snapshot`)
  } else {
    if (!robots.includes('noindex')) problems.push(`${where}: private page is missing noindex`)
    if (canonical) problems.push(`${where}: private page should not declare a canonical`)
  }
}

function checkSitemap(sitemap: string | null, problems: string[]): void {
  if (sitemap === null) return void problems.push('sitemap.xml: missing')
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  const expected = INDEXABLE_PAGES.map((page) => absoluteUrl(page.path))
  if (new Set(listed).size !== listed.length) problems.push('sitemap.xml: duplicate URLs')
  listed
    .filter((url) => !url.startsWith(`${SITE.origin}/`))
    .forEach((url) => problems.push(`sitemap.xml: ${url} is not on ${SITE.origin}`))
  if ([...listed].sort().join() !== [...expected].sort().join()) {
    problems.push(`sitemap.xml: lists ${listed.join(', ')} but the public pages are ${expected.join(', ')}`)
  }
}

function checkRobots(robots: string | null, problems: string[]): void {
  if (!robots?.includes(`Sitemap: ${absoluteUrl('/sitemap.xml')}`)) {
    problems.push('robots.txt: missing, or does not point at the sitemap')
  }
  if (robots && /^Disallow:\s*\/\s*$/m.test(robots)) problems.push('robots.txt: blocks the whole site')
}

export function validateOutput(outDir: string): void {
  const problems: string[] = []

  for (const page of [...PAGES, NOT_FOUND_PAGE]) {
    const html = read(outDir, page.file)
    if (html === null) problems.push(`${page.file}: missing`)
    else checkPage(html, page, problems)
  }

  const titles = INDEXABLE_PAGES.map((page) => page.title)
  if (new Set(titles).size !== titles.length) problems.push('two public pages share a <title>')

  checkSitemap(read(outDir, 'sitemap.xml'), problems)
  checkRobots(read(outDir, 'robots.txt'), problems)
  if (read(outDir, `${SITE.indexNowKey}.txt`)?.trim() !== SITE.indexNowKey) {
    problems.push('IndexNow key file is missing or does not match the key')
  }

  if (problems.length > 0) throw new Error(`SEO check failed:\n  - ${problems.join('\n  - ')}`)
}
