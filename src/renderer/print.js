/**
 * Create a printable HTML file.
 */
import { readVFile, writeFile } from '../common/files'
import hast from 'mdast-util-to-hast'
import html from 'hast-util-to-html'
import createTheme from './theme'
import path from 'path'
import { status } from '../common/log'
import { createFormatter } from './markdown'
import redirect from 'remark-redirect'
import tree from './unist/unist-util-to-tree'

const createProcessor = config =>
  createFormatter(config)
    .use(redirect)
    .use(tree)

export default async function (config) {
  const files = [
    ...config.summary.prefix,
    ...config.summary.chapters,
    ...config.summary.suffix
  ].map(({ url }) => path.join(config.source, url))

  const processor = createProcessor(config)
  const theme = await createTheme(config)

  const trees = await Promise.all(
    files.map(file => readVFile(file).then(processor.process))
  )

  const children = trees.reduce(
    (acc, val) => acc.concat(val.contents.children),
    []
  )

  // TODO: Might need to change child nodes (such as merge References)

  const node = {
    type: 'root',
    children
  }

  const content = html(hast(node))

  const filename = path.join(config.destination, 'print.html')

  const data = theme.print({
    book_title: config.title,
    content,
    title: config.title,
    root: ''
  })

  status('Writing print.html')

  await writeFile(filename, data)
  await theme.copy()

  return config
}
