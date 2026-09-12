// build/seo/plugin.ts
// Vite plugin that turns the single built index.html into one HTML file per
// route, each with its own title, description, canonical, social tags, JSON-LD
// and crawler snapshot; writes sitemap.xml, robots.txt, llms.txt and the
// IndexNow key; then checks the result and fails the build if it is wrong.
import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import type { HeadTag } from '../../src/seo/headTags.ts'
import { NOT_FOUND_PAGE, PAGES } from '../../src/seo/pages.ts'
import { SITE } from '../../src/seo/site.ts'
import { crawlerFiles } from './crawlerFiles.ts'
import { renderPage } from './html.ts'
import { validateOutput } from './validate.ts'

export interface SeoPluginOptions {
  /** Google Search Console token, when verifying with the HTML-tag method. */
  googleVerification?: string
  /** Bing Webmaster Tools token, when verifying with the HTML-tag method. */
  bingVerification?: string
}

// Build variables win; otherwise the tokens committed in SITE.verification.
function verificationTags(options: SeoPluginOptions): HeadTag[] {
  const google = options.googleVerification || SITE.verification.google
  const bing = options.bingVerification || SITE.verification.bing
  const tags: HeadTag[] = []
  if (google) tags.push({ tag: 'meta', attrs: { name: 'google-site-verification', content: google } })
  if (bing) tags.push({ tag: 'meta', attrs: { name: 'msvalidate.01', content: bing } })
  return tags
}

export function seoPlugin(options: SeoPluginOptions = {}): Plugin {
  let outDir = ''

  return {
    name: 'swipass-seo',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    writeBundle() {
      const template = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8')
      const siteTags = verificationTags(options)
      const files: Record<string, string> = crawlerFiles()
      for (const page of [...PAGES, NOT_FOUND_PAGE]) files[page.file] = renderPage(template, page, siteTags)
      for (const [file, content] of Object.entries(files)) fs.writeFileSync(path.join(outDir, file), content)
      validateOutput(outDir)
    },
  }
}
