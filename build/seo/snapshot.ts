// build/seo/snapshot.ts
// The static content placed inside #root for each route. Crawlers that do not
// run JavaScript (most AI crawlers and link unfurlers) read this; React
// replaces it on mount. It restates what the page shows and nothing more.
import { FAQS } from '../../src/content/faq.ts'
import { FEATURES } from '../../src/content/features.ts'
import { INDEXABLE_PAGES, type SeoPage, type SnapshotBlock } from '../../src/seo/pages.ts'
import { SITE } from '../../src/seo/site.ts'
import { escapeHtml as e } from './escape.ts'

// Lives inside #root, so React removes it on mount. The background keeps the
// snapshot legible even when the stylesheet has not loaded.
const STYLE = `<style>
html,body{background:#0a0a0a}
.seo-snapshot{max-width:44rem;margin:0 auto;padding:4rem 1.5rem;font:.875rem/1.8 'DM Mono',ui-monospace,monospace;color:#a3a3a3}
.seo-snapshot nav{display:flex;flex-wrap:wrap;gap:1.5rem;margin-bottom:3rem;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase}
.seo-snapshot a{color:#d4d4d4;text-decoration:none}
.seo-snapshot h1{margin:0 0 1.5rem;font:800 clamp(2rem,6vw,3.25rem)/1.05 Syne,sans-serif;letter-spacing:-.03em;color:#f5f5f5}
.seo-snapshot h2{margin:3rem 0 1rem;font:700 1.25rem/1.3 Syne,sans-serif;color:#e5e5e5}
.seo-snapshot h3{margin:1.5rem 0 .25rem;font:600 .95rem/1.4 Syne,sans-serif;color:#d4d4d4}
.seo-snapshot p{margin:0 0 1rem}
</style>`

const questionList = (heading: string, items: { title: string; body: string }[]): string =>
  `<section><h2>${e(heading)}</h2>${items.map((item) => `<h3>${e(item.title)}</h3><p>${e(item.body)}</p>`).join('')}</section>`

const BLOCKS: Record<SnapshotBlock, () => string> = {
  features: () =>
    questionList('Everything needed to move value', FEATURES.map((f) => ({ title: f.title, body: f.desc }))),
  faq: () => questionList('Common questions', FAQS.map((f) => ({ title: f.q, body: f.a }))),
}

function nav(): string {
  const links = INDEXABLE_PAGES.map((page) => `<a href="${page.path}">${e(page.label)}</a>`)
  const external = SITE.sameAs.map((url) => `<a href="${url}" rel="noopener">GitHub</a>`)
  return `<nav aria-label="${e(SITE.name)}">${[...links, ...external].join('')}</nav>`
}

export function renderSnapshot(page: SeoPage): string {
  const body = [
    nav(),
    `<h1>${e(page.heading)}</h1>`,
    ...page.summary.map((paragraph) => `<p>${e(paragraph)}</p>`),
    ...(page.snapshot ?? []).map((block) => BLOCKS[block]()),
  ].join('')
  return `${STYLE}<main class="seo-snapshot">${body}</main>`
}
