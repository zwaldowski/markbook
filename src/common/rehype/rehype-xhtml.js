// Rehype plugin for converting non-XHTML5 content.
import visit from 'unist-util-visit'
import first from '../unist/unist-util-first.js'

export default function () {
  return tree => {
    // Add xmlns to root tag
    first(tree, { tagName: 'html' }).properties.xmlns =
      'http://www.w3.org/1999/xhtml'

    // Replace align= with style="text-align:"
    visit(tree, [{ tagName: 'th' }, { tagName: 'td' }], node => {
      const align = node.properties.align
      if (!align) {
        return
      }
      node.properties.style = `text-align:${align}`
      delete node.properties.align
    })
  }
}
