import findAfter from 'unist-util-find-after'
import findBefore from 'unist-util-find-before'
import path from 'path'
import { readVFile } from '../common/files'
import { reject } from '../common/errors'
import { createParser } from '../renderer/markdown'
import mapFirst from '../renderer/unist/unist-util-map-first'
import tree from '../renderer/unist/unist-util-to-tree'
import flatMap from '../renderer/unist/unist-util-flat-map'

/// For a chapter list, guess whether it is frontmatter, bodymatter, or backmatter.
const inferPartition = (node, parent) => {
  const hasBefore = findBefore(parent, node, 'list')
  const hasAfter = findAfter(parent, node, 'list')
  if (hasAfter && !hasBefore) {
    return 'frontmatter'
  } else if (hasBefore && !hasAfter) {
    return 'backmatter'
  } else {
    return 'bodymatter'
  }
}

/// A node's value, title, or the values or titles of all its children.
const plainText = node =>
  node.value ||
  node.title ||
  (node.children &&
    node.children.reduce((acc, val) => acc.concat(plainText(val)), '')) ||
  ''

/// Returns summary items for the chapters in a list.
const extractChapters = (
  node,
  _index,
  parent,
  type = inferPartition(node, parent),
  parentNumbering = []
) =>
  flatMap(
    node,
    'listItem',
    (item, index) => {
      const numbering = parentNumbering.concat(index + 1)
      const { title, url } = mapFirst(item, 'paragraph', para => ({
        title: plainText(para),
        url: mapFirst(para, 'link', link => link.url)
      }))
      const children = mapFirst(item, 'list', (list, index, parent) =>
        extractChapters(list, index, parent, type, numbering)
      )

      return {
        type,
        title,
        url,
        children,
        numbering
      }
    },
    false
  )

/// Remark plugin to compute a markbook summary item tree.
const plugin = () => parent => ({
  type: 'root',
  children: flatMap(parent, 'list', extractChapters, false).flat()
})

/// Parse SUMMARY.md (wrapped for better reject messages).
const processFile = async file => {
  const contents = await readVFile(file)
  const processor = createParser()
    .use(plugin)
    .use(tree)
  return processor
    .process(contents)
    .catch(e => reject('Error parsing SUMMARY.md', e))
}

/// Load and parse a SUMMARY.md file.
export default async function (config) {
  const file = path.join(config.source, 'SUMMARY.md')
  const summary = await processFile(file)
  return {
    ...config,
    summary
  }
}
