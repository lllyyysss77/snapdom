import { describe, it, expect, afterEach } from 'vitest'
import { snapdom } from '../src/api/snapdom.js'

// #494: values typed into form controls inside a same-origin iframe were not captured.
// rasterizeIframe captures iframe.contentDocument.documentElement from the PARENT realm,
// so `node instanceof HTMLInputElement` is false for iframe nodes (each window has its own
// constructors) and the value/checked/selected freeze in clone.js was skipped.

function decodeSvg(result) {
  const raw = result.toRaw()
  return decodeURIComponent(raw.slice(raw.indexOf(',') + 1))
}

// Firefox swaps native checkbox/radio for an inline-SVG replacement (createCheckboxRadioReplacement);
// a checked box is the one that draws the tick <path>. Other engines keep the <input checked>.
function expectChecked(svg) {
  const i = svg.indexOf('data-snapdom-input-replacement="checkbox"')
  if (i !== -1) {
    const block = svg.slice(i, svg.indexOf('</svg>', i))
    expect(block).toContain('<path')
  } else {
    expect(svg).toMatch(/id="c"[^>]*checked="[^"]*"|checked="[^"]*"[^>]*id="c"/)
  }
}

describe('form control values inside a same-origin iframe (#494)', () => {
  let iframe

  let wrap

  afterEach(() => {
    if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap)
  })

  function makeIframe() {
    wrap = document.createElement('div')
    wrap.style.cssText = 'width:320px;padding:8px;background:#fff'
    iframe = document.createElement('iframe')
    iframe.style.cssText = 'width:320px;height:200px;border:0'
    wrap.appendChild(iframe)
    document.body.appendChild(wrap)
    const doc = iframe.contentDocument
    doc.open()
    doc.write(`<html><body style="margin:0">
      <input id="t" type="text">
      <input id="r" type="range" min="0" max="100" value="0">
      <input id="c" type="checkbox">
      <textarea id="ta"></textarea>
      <select id="s"><option value="a">A</option><option value="b">B</option></select>
    </body></html>`)
    doc.close()
    return doc
  }

  it('freezes typed values when the capture root lives in another realm', async () => {
    const doc = makeIframe()
    // Sanity: iframe nodes are NOT instances of the parent realm constructors.
    expect(doc.getElementById('t') instanceof HTMLInputElement).toBe(false)

    doc.getElementById('t').value = '12'
    doc.getElementById('r').value = '80'
    doc.getElementById('c').checked = true
    doc.getElementById('ta').value = 'hello'
    doc.getElementById('s').value = 'b'

    // Same call rasterizeIframe performs for the nested capture.
    const result = await snapdom(doc.documentElement, { embedFonts: false })
    const svg = decodeSvg(result)

    expect(svg).toMatch(/id="t"[^>]*value="12"|value="12"[^>]*id="t"/)
    expect(svg).toMatch(/id="r"[^>]*value="80"|value="80"[^>]*id="r"/)
    expectChecked(svg)
    expect(svg).toMatch(/<textarea[^>]*>hello<\/textarea>/)
    // Firefox serializes boolean attributes as selected="selected", Chromium/WebKit as selected="".
    expect(svg).toMatch(/<option[^>]*value="b"[^>]*selected="[^"]*"|<option[^>]*selected="[^"]*"[^>]*value="b"/)
  })

  it('freezes values through the real iframe path (parent captures the <iframe>)', async () => {
    const doc = makeIframe()
    doc.getElementById('t').value = '12'
    doc.getElementById('r').value = '80'

    // rasterizeIframe rasterizes the iframe document through context.snap.toPng, which main()
    // wires to snapdom.toPng. Wrap it to read the nested SVG before it becomes a PNG.
    let nestedSvg = ''
    const origToPng = snapdom.toPng
    snapdom.toPng = async (el, opts) => {
      const r = await snapdom(el, opts)
      nestedSvg = decodeSvg(r)
      return r.toPng()
    }
    let psvg
    try {
      psvg = decodeSvg(await snapdom(wrap, { embedFonts: false }))
    } finally {
      snapdom.toPng = origToPng
    }

    // The parent got the rasterized wrapper (an <img>), not the placeholder fallback.
    expect(psvg).toContain('<img')
    expect(nestedSvg).not.toBe('')
    expect(nestedSvg).toMatch(/id="t"[^>]*value="12"|value="12"[^>]*id="t"/)
    expect(nestedSvg).toMatch(/id="r"[^>]*value="80"|value="80"[^>]*id="r"/)
  })
})
