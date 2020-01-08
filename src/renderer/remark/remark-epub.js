/**
 * Remark plugin for formatting content for EPUB.
 */
import visit from 'unist-util-visit'

export default function (options = {}) {
  return tree => {
    // Change links to EPUB spec (cli/README.md -> cli-index.xhtml)
    visit(tree, ['link', 'definition'], node => {
      node.url = node.url
        .replace(/README\.md/, 'index.xhtml')
        .replace(/\.md/, '.xhtml')

      if (!/^(http|:\/\/)/.test(node.url)) {
        node.url = node.url.split('/').join('-')
      }
    })
  }
}
