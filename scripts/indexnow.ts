// scripts/indexnow.ts
// Tells IndexNow engines (Bing, Yandex, Seznam, Naver and others) which public
// pages changed, so they recrawl them without waiting for the sitemap.
//
//   git diff --name-only <from> <to> | node scripts/indexnow.ts   pages whose sources changed
//   node scripts/indexnow.ts --all                                every public page
//   add --dry-run to print the request instead of sending it
//
// Runs under Node 22.18+ directly, which strips the TypeScript types.
import { INDEXABLE_PAGES, SHARED_SOURCES } from '../src/seo/pages.ts'
import { SITE, absoluteUrl } from '../src/seo/site.ts'

const ENDPOINT = 'https://api.indexnow.org/indexnow'

const touches = (file: string, sources: readonly string[]): boolean =>
  sources.some((source) => (source.endsWith('/') ? file.startsWith(source) : file === source))

function changedPages(files: string[]): string[] {
  const everything = files.some((file) => touches(file, SHARED_SOURCES))
  return INDEXABLE_PAGES.filter((page) => everything || files.some((file) => touches(file, page.sources))).map(
    (page) => absoluteUrl(page.path),
  )
}

async function readChangedFiles(): Promise<string[]> {
  if (process.stdin.isTTY) return []
  let input = ''
  for await (const chunk of process.stdin) input += chunk
  return input.split('\n').map((line) => line.trim()).filter(Boolean)
}

const args = new Set(process.argv.slice(2))
const urls = args.has('--all') ? INDEXABLE_PAGES.map((page) => absoluteUrl(page.path)) : changedPages(await readChangedFiles())

if (urls.length === 0) {
  console.log('No public page changed; nothing to submit.')
  process.exit(0)
}

const payload = {
  host: new URL(SITE.origin).host,
  key: SITE.indexNowKey,
  keyLocation: absoluteUrl(`/${SITE.indexNowKey}.txt`),
  urlList: urls,
}

if (args.has('--dry-run')) {
  console.log(JSON.stringify(payload, null, 2))
  process.exit(0)
}

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
})

// 200 and 202 both mean the submission was received.
if (response.status !== 200 && response.status !== 202) {
  console.error(`IndexNow rejected the submission: HTTP ${response.status} ${await response.text()}`)
  process.exit(1)
}
console.log(`Submitted ${urls.length} URL(s) to IndexNow:\n${urls.join('\n')}`)
