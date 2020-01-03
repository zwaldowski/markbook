/**
 * Render CommonMark.
 */
import path from 'path'
import { status } from '../common/log'
import { readVFile, writeFile } from '../common/files'
import createTheme from './theme'
import { createFormatter } from './markdown'
import createToc from './toc'
import redirect from 'remark-redirect'
import SearchIndex from './search'
import remark2rehype from 'remark-rehype'
import katex from 'rehype-katex'
import html from 'rehype-stringify'
import flatMap from './unist/unist-util-flat-map'

const createProcessor = (config, searchIndex) =>
  createFormatter(config)
    .use(redirect)
    .use(searchIndex)
    .use(remark2rehype)
    .use(katex)
    .use(html)

const read = (config, item) => readVFile(path.join(config.source, item.url))

const write = async (config, template, vfile) => {
  const content = vfile.contents.toString()

  // Make sure we don't end up with a title like "Markbook - Markbook"
  const title = vfile.data.title
    ? `${config.title} - ${vfile.data.title}`
        .replace(`${config.title} - ${config.title}`, config.title)
        .replace(/\s-\s$/, '')
    : config.title

  // Replace ".md" with ".html" and use "index.html" instead of "README.md"
  const filename = path
    .relative(config.source, vfile.path)
    .replace(/README\.md$/, 'index.md')
    .replace(/\.md$/, '')
    .concat('.html')
  const filepath = path.join(config.destination, filename)

  // Calculate root for CSS/JS/Links
  const root = path.relative(path.dirname(filepath), config.destination)

  const data = template({
    ...vfile.data,
    book_title: config.title,
    toc: config.toc,
    content,
    title,
    root
  })

  status('Writing', filename)
  await writeFile(filepath, data)
}

const renderFiles = async (config, processor, theme) => {
  await Promise.all(
    flatMap(config.summary.contents, async item => {
      const input = await read(config, item)
      const output = await processor.process(input)
      await write(config, theme.template, output)
    })
  )

  await theme.copy()
}

export default async function (config) {
  const searchIndex = new SearchIndex(config)
  const processor = createProcessor(config, searchIndex)

  config.toc = createToc(config)

  const theme = await createTheme(config)
  await renderFiles(config, processor, theme)

  status('Writing search index')
  await searchIndex.export()

  status('Done')
  return config
}
