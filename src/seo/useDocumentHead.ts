// src/seo/useDocumentHead.ts
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { pageHead, type HeadTag } from './headTags.ts'
import { resolvePage } from './pages.ts'

// Tags the build wrote, and tags this hook writes, carry data-seo, so a route
// change swaps exactly those and leaves icons, fonts and verification alone.
const MANAGED = 'data-seo'

function toElement({ tag, attrs, text }: HeadTag): HTMLElement {
  const element = document.createElement(tag)
  Object.entries(attrs).forEach(([name, value]) => element.setAttribute(name, value))
  element.setAttribute(MANAGED, '')
  if (text !== undefined) element.textContent = text
  return element
}

/** Keeps <head> in step with client-side navigation. */
export function useDocumentHead(): void {
  const { pathname } = useLocation()

  useEffect(() => {
    const { title, tags } = pageHead(resolvePage(pathname))
    document.title = title
    document.head.querySelectorAll(`[${MANAGED}]`).forEach((element) => element.remove())
    document.head.append(...tags.map(toElement))
  }, [pathname])
}
