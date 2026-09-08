import { describe, it, expect, afterEach } from 'vitest'
import { snapdom } from '../src/api/snapdom.js'
import { colorTint } from '../packages/plugins/color-tint.js'

function decodeSvg(result) {
  const raw = result.toRaw()
  return decodeURIComponent(raw.slice(raw.indexOf(',') + 1))
}

describe('colorTint plugin', () => {
  let el, iframe

  afterEach(() => {
    if (el && el.parentNode) el.parentNode.removeChild(el)
    if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe)
  })

  it('adds the tint overlay on a same-realm capture', async () => {
    el = document.createElement('div')
    el.style.cssText = 'width:40px;height:40px;background:#eee'
    document.body.appendChild(el)

    const result = await snapdom(el, { plugins: [colorTint({ color: 'blue' })], embedFonts: false })
    expect(decodeSvg(result)).toMatch(/mix-blend-mode:\s*color/)
  })

  // #494: nodes from a same-origin iframe are not instances of the parent realm's HTMLElement,
  // so the plugin used to bail out silently when the capture root lived in an iframe.
  it('adds the tint overlay when the capture root lives in an iframe (#494)', async () => {
    iframe = document.createElement('iframe')
    iframe.style.cssText = 'width:200px;height:120px;border:0'
    document.body.appendChild(iframe)
    const doc = iframe.contentDocument
    doc.open()
    doc.write('<html><body style="margin:0"><div id="box" style="width:40px;height:40px;background:#eee"></div></body></html>')
    doc.close()
    const box = doc.getElementById('box')
    expect(box instanceof HTMLElement).toBe(false)

    const result = await snapdom(box, { plugins: [colorTint({ color: 'blue' })], embedFonts: false })
    expect(decodeSvg(result)).toMatch(/mix-blend-mode:\s*color/)
  })
})
