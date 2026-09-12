// build/seo/html.ts
// Renders the shared head-tag model into HTML and fills a route's copy of the
// built index.html with its head and crawler snapshot.
import { pageHead, type HeadTag } from '../../src/seo/headTags.ts'
import type { SeoPage } from '../../src/seo/pages.ts'
import { escapeHtml } from './escape.ts'
import { renderSnapshot } from './snapshot.ts'

export const HEAD_SLOT = '<!--seo:head-->'
export const BODY_SLOT = '<!--seo:body-->'

function renderTag({ tag, attrs, text }: HeadTag, managed: boolean): string {
  const attributes = Object.entries(attrs)
    .map(([name, value]) => ` ${name}="${escapeHtml(value)}"`)
    .join('')
  const marker = managed ? ' data-seo' : ''
  // JSON-LD is JSON, not HTML: escape "<" as \u003c so no value can close the tag.
  if (tag === 'script') return `<script${marker}${attributes}>${(text ?? '').replace(/</g, '\\u003c')}</script>`
  return `<${tag}${marker}${attributes} />`
}

/**
 * Fills the template for one page. `siteTags` are tags every page carries but
 * the runtime must not swap (search-engine verification), so they are unmarked.
 */
export function renderPage(template: string, page: SeoPage, siteTags: HeadTag[]): string {
  if (!template.includes(HEAD_SLOT) || !template.includes(BODY_SLOT)) {
    throw new Error(`index.html must contain ${HEAD_SLOT} and ${BODY_SLOT}`)
  }
  const { title, tags } = pageHead(page)
  const head = [
    `<title>${escapeHtml(title)}</title>`,
    ...tags.map((tag) => renderTag(tag, true)),
    ...siteTags.map((tag) => renderTag(tag, false)),
  ].join('\n  ')
  // Function replacers, so "$" in copy is never read as a replacement pattern.
  return template.replace(HEAD_SLOT, () => head).replace(BODY_SLOT, () => renderSnapshot(page))
}
