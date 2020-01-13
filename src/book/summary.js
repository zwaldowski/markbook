import toString from 'mdast-util-to-string'
import unified from 'unified'
import u from 'unist-builder'
import findAll from '../common/unist/unist-util-find-all.js'
import first from '../common/unist/unist-util-first.js'
import tree from '../common/unist/unist-util-to-tree.js'
import VFile from '../common/vfile.js'
import markdown from '../renderer/markdown.js'

/// For a chapter list, guess whether it is frontmatter, bodymatter, or backmatter.
const inferPartition = (_node, index, parent) => {
  const hasBefore = index !== 0
  const hasAfter = index !== parent.length - 1
  if (hasAfter && !hasBefore) {
    return 'frontmatter'
  } else if (hasBefore && !hasAfter) {
    return 'backmatter'
  } else {
    return 'bodymatter'
  }
}

/// Returns summary items for the chapters in a list.
const extractChapters = (node, file, type, parentNumbering = []) =>
  findAll(node, 'listItem').flatMap((item, index) => {
    const numbering = parentNumbering.concat(index + 1)

    const paragraph = first(item, 'paragraph')
    const link = first(paragraph, 'link')
    const path = link && link.url
    const title = link && toString(link)

    const list = first(item, 'list')
    const children = list ? extractChapters(list, file, type, numbering) : []

    file.assert(
      path,
      'Summary item must contain link to chapter',
      paragraph || item
    )
    file.assert(title.length, 'Summary item must have title', paragraph || item)

    return new VFile({
      type,
      id: path.replace(/[^a-zA-Z0-9_-]/g, '_'),
      title,
      path,
      children,
      numbering,
      cwd: file.cwd
    })
  })

/// Remark plugin to compute a markbook summary item tree.
const summary = () => (root, file) =>
  u(
    'root',
    findAll(root, 'list').flatMap((list, index, parent) =>
      extractChapters(list, file, inferPartition(list, index, parent))
    )
  )

const processor = unified()
  .use(markdown)
  .use(summary)
  .use(tree)

/// Load and parse a SUMMARY.md file.
export default async function (config) {
  const summary = new VFile({
    cwd: config.source,
    path: 'SUMMARY.md'
  })
  await summary.read()
  await processor.process(summary)
  return {
    ...config,
    summary: summary.contents
  }
}
