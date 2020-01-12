/**
 * Create an ePub file.
 */
import archiver from 'archiver'
import fs from 'fs'
import mime from 'mime'
import path from 'path'
import remark2rehype from 'remark-rehype'
import document from 'rehype-document'
import unified from 'unified'
import { status } from '../common/log'
import markdown from './markdown'
import collectAssets from './remark/remark-assets'
import epub from './remark/remark-epub'
import findAll from '../common/unist/unist-util-find-all'
import { h, xhtml, textFile, xhtmlFile, xmlFile, x } from '../common/templating'
import types from '../common/types'

const createProcessor = config =>
  unified()
    .use(markdown)
    .use(collectAssets)
    .use(epub)
    .use(remark2rehype)
    .use(document, {
      title: config.title,
      language: config.language
    })
    .use(xhtml)
    .use(() => (_tree, file) => {
      file.cwd = config.destination
      file.extname = '.xhtml'
    })

const zip = (filename, dir) =>
  new Promise((resolve, reject) => {
    const output = fs.createWriteStream(filename)
    const archive = archiver('zip', {
      zlib: { level: 0 }
    })
    output.on('close', () => resolve())
    archive.on('error', err => reject(err))
    archive.pipe(output)
    archive.glob('mimetype', { cwd: dir }, { store: true })
    archive.glob('**/!(mimetype)', { cwd: dir })
    archive.finalize()
  })

const makeMimetypeFile = () => textFile('mimetype', types.epub.mediaType)

const makeContainerFile = () =>
  xmlFile(
    'META-INF/container',
    x('container', types.ocf.identifier, [
      x('rootfiles', [
        x('rootfile', {
          'full-path': 'content.opf',
          'media-type': types.opf.mediaType
        })
      ])
    ])
  )

const authorsList = (authors, language) =>
  new Intl.ListFormat(language).format(authors)

const makePackageDocument = (
  { identifier, title, language, description, authors = [] },
  files,
  assets
) =>
  xmlFile(
    'content.opf',
    x(
      'package',
      {
        xmlns: types.opf.xmlns,
        version: types.opf.version,
        'xml:lang': language,
        'unique-identifier': 'pub-id'
      },
      [
        x('metadata', types.dc, [
          x('dc:identifier', { id: 'pub-id' }, identifier),
          x(
            'meta',
            { property: 'dcterms:modified' },
            `${new Date().toISOString().slice(0, -5)}Z`
          ),
          title && title.length && x('dc:title', title),
          language && x('dc:language', language),
          description && description.length && x('dc:description', description),
          authors.length && x('dc:creator', authorsList(authors, language))
        ]),
        x('manifest', [
          x('item', {
            'media-type': types.xhtml.mediaType,
            id: 'toc',
            href: 'toc.xhtml',
            properties: 'nav'
          }),
          x('item', {
            'media-type': types.ncx.mediaType,
            id: 'ncx',
            href: 'toc.ncx'
          }),
          ...files.map(({ path }, i) =>
            x('item', {
              'media-type': types.xhtml.mediaType,
              id: `item${i}`,
              href: path
            })
          ),
          ...assets.map(({ mediaType, path }, i) =>
            x('item', { 'media-type': mediaType, id: `asset${i}`, href: path })
          )
        ]),
        x(
          'spine',
          { toc: 'ncx' },
          [...files.keys()].map(i => x('itemref', { idref: `item${i}` }))
        )
      ]
    )
  )

const tocList = items =>
  items.length
    ? [
        h(
          'ol',
          items.map(({ type, path: href, title, children = [] }) =>
            h('li', [
              h('a', { href, 'epub:type': type }, title),
              tocList(children)
            ])
          )
        )
      ]
    : []

const makeTOC = ({ title, language, summary: { children: topLevel } }) =>
  xhtmlFile('toc', [
    h('html', { ...types.ops, 'xml:lang': language }, [
      h('head', [h('title', title)]),
      h('body', [h('nav', { 'epub:type': 'toc' }, tocList(topLevel))])
    ])
  ])

const depth = parent =>
  (parent.children
    ? parent.children.reduce((acc, child) => Math.max(acc, depth(child)), 0)
    : 0) + 1

const compatibilityTOCItems = items =>
  items.map(({ id, title, path: src, children = [] }) =>
    x('navPoint', { id }, [
      x('navLabel', [x('text', title)]),
      x('content', { src }),
      compatibilityTOCItems(children)
    ])
  )

const makeCompatibilityTOC = ({
  title,
  language,
  authors = [],
  summary: topLevel
}) =>
  xmlFile(
    'toc.ncx',
    x(
      'ncx',
      {
        xmlns: types.ncx.xmlns,
        version: types.ncx.version,
        'xml:lang': language
      },
      [
        x('head', [
          x('meta', { name: 'dtb:depth', content: depth(topLevel) - 1 }),
          x('meta', { name: 'dtb:totalPageCount', content: 0 }),
          x('meta', { name: 'dtb:maxPageNumber', content: 0 })
        ]),
        x('docTitle', [x('text', title)]),
        x('docAuthor', [x('text', authorsList(authors, language))]),
        x('navMap', compatibilityTOCItems(topLevel.children))
      ]
    )
  )

export default async function (config) {
  const epubRoot = path.join(config.destination, 'epub')
  const processor = createProcessor({
    ...config,
    destination: epubRoot
  })

  // Render and copy all XHTML files.
  const chapters = findAll(config.summary, { recursive: true })
  await Promise.all(
    chapters.map(async file => {
      await file.read()
      await processor.process(file)
      status(`Writing ${file.path}`)
      await file.write()
    })
  )

  // Collect and copy all assets.
  const assets = [...new Set(chapters.flatMap(chapter => chapter.data.assets))]
    .sort()
    .map(assetPath => ({
      path: assetPath,
      mediaType: mime.getType(path.extname(assetPath))
    }))

  await Promise.all(
    assets.map(async ({ path: assetPath }) => {
      const input = path.join(config.source, assetPath)
      const output = path.join(epubRoot, assetPath)
      await fs.promises.mkdir(path.dirname(output), { recursive: true })
      await fs.promises.copyFile(input, output)
    })
  )

  // Create and write content documents.
  const files = [
    makeMimetypeFile(),
    makeContainerFile(),
    makePackageDocument(config, chapters, assets),
    makeTOC(config),
    makeCompatibilityTOC(config)
  ]

  await Promise.all(
    files.map(file => {
      file.cwd = epubRoot
      return file.write()
    })
  )

  // Generate the final EPUB file.
  status('Generating book.epub')

  const output = path.join(config.destination, 'book.epub')
  await zip(output, epubRoot)
  return output
}
