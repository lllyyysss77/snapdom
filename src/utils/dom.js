/**
 * Realm-agnostic DOM predicates.
 *
 * `node instanceof HTMLInputElement` is false for a node that belongs to another window
 * (a same-origin iframe document, a DOMParser document, ...) because every realm owns its
 * constructors. snapdom captures iframe documents from the parent realm (rasterizeIframe),
 * so type checks on captured nodes must go through these helpers, never `instanceof` (#494).
 */

export const HTML_NS = 'http://www.w3.org/1999/xhtml'
export const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * Element in the XHTML namespace, whatever realm it comes from.
 * @param {any} node
 * @returns {node is HTMLElement}
 */
export function isHTMLElement(node) {
  return !!node && node.nodeType === 1 && node.namespaceURI === HTML_NS
}

/**
 * HTML element whose local name is one of `names`, e.g. isHTMLTag(n, 'input', 'textarea').
 * @param {any} node
 * @param {...string} names lowercase tag names
 * @returns {boolean}
 */
export function isHTMLTag(node, ...names) {
  return isHTMLElement(node) && names.includes(node.localName)
}

/**
 * Element in the SVG namespace, whatever realm it comes from.
 * @param {any} node
 * @returns {node is SVGElement}
 */
export function isSVGElement(node) {
  return !!node && node.nodeType === 1 && node.namespaceURI === SVG_NS
}

/**
 * Outer or nested `<svg>` element.
 * @param {any} node
 * @returns {node is SVGSVGElement}
 */
export function isSVGRoot(node) {
  return isSVGElement(node) && node.localName === 'svg'
}

/**
 * ShadowRoot (a DocumentFragment with a host).
 * @param {any} node
 * @returns {node is ShadowRoot}
 */
export function isShadowRoot(node) {
  return !!node && node.nodeType === 11 && !!node.host
}

/**
 * @param {any} node
 * @returns {node is Document}
 */
export function isDocument(node) {
  return !!node && node.nodeType === 9
}

/**
 * Any DOM Node (element, text, fragment, document...).
 * @param {any} value
 * @returns {value is Node}
 */
export function isNode(value) {
  return !!value && typeof value.nodeType === 'number' && typeof value.nodeName === 'string'
}
