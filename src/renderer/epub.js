/**
 * Create an ePub file.
 */
import archiver from 'archiver'
import epub from './remark/remark-epub'
import fs from 'fs'
import Handlebars from './handlebars'
import html from 'rehype-stringify'
import katex from 'rehype-katex'
import path from 'path'
import remark2rehype from 'remark-rehype'
import {
  createPath,
  readFile,
  readVFile,
  writeFile,
  readdir
} from '../common/files'
import { status } from '../common/log'
import { createFormatter } from './markdown'
import mime from 'mime'
import flatMap from './unist/unist-util-flat-map'

const createProcessor = config =>
  createFormatter(config)
    .use(epub)
    .use(remark2rehype)
    .use(katex)
    .use(html, {
      closeSelfClosing: true
    })

const zip = (filename, dir, files) =>
  new Promise((resolve, reject) => {
    const output = fs.createWriteStream(filename)
    const archive = archiver('zip', {
      zlib: { level: 0 }
    })
    output.on('close', () => resolve())
    archive.on('error', err => reject(err))
    archive.pipe(output)
    archive.directory(dir, false)
    archive.finalize()
  })

const getURL = filename =>
  filename
    .replace(/README\.md$/, 'index.md')
    .replace(/\.md$/, '')
    .concat('.xhtml')

const toTOC = item => ({
  type: item.type,
  title: item.title,
  url: getURL(item.url),
  children: item.children ? item.children.map(toTOC) : null,
  id: item.url.replace(/[^a-zA-Z0-9_-]/g, '_')
})

const depth = parent =>
  (parent.children
    ? parent.children.reduce((acc, child) => Math.max(acc, depth(child)), 0)
    : 0) + 1

export default async function (config) {
  const epubDataDir = createPath('epub')
  const epubFilename = path.join(epubDataDir, 'epub.hbs')
  const processor = createProcessor({
    ...config,
    destination: path.join(config.destination, 'epub', 'EPUB')
  })
  const compile = params => data => Handlebars.compile(data.toString())(params)

  const epubTemplate = await readFile(epubFilename).then(data =>
    Handlebars.compile(data.toString())
  )

  // Create list of XHTML files to generate.
  const htmlFiles = flatMap(config.summary.contents, ({ url }) => [
    path.join(config.source, url),
    getURL(url)
  ])

  // Create Table of Contents
  const toc = config.summary.contents.children.map(toTOC)
  const tocDepth = depth(config.summary.contents) - 1

  const epubDir = path.join(config.destination, 'epub', 'EPUB')

  // Render and copy all XHTML files.
  await Promise.all(
    htmlFiles.map(([input, output]) =>
      readVFile(input)
        .then(processor.process)
        .then(content => {
          const epub = path.join(epubDir, output)
          const root = path.relative(path.dirname(epub), epubDir)
          const data = epubTemplate({
            title: config.title,
            content,
            root
          })

          status(`Writing ${output}`)

          return writeFile(epub, data)
        })
    )
  )

  const assets = (await readdir(epubDir))
    .filter(
      assetPath =>
        !path.basename(assetPath).startsWith('.') &&
        path.extname(assetPath) !== '.xhtml'
    )
    .map(assetPath => ({
      href: path.relative(epubDir, assetPath),
      mediaType: mime.getType(path.extname(assetPath))
    }))

  const list = new Intl.ListFormat(config.language)
  const creator = list.format(config.authors)
  const modified = `${new Date().toISOString().slice(0, -5)}Z`

  // List of epub data files
  const epubFiles = [
    ['mimetype'],
    [path.join('META-INF', 'container.xml')],
    [
      path.join('EPUB', 'content.opf'),
      {
        creator,
        modified,
        identifier: config.identifier,
        title: config.title,
        language: config.language,
        description: config.description,
        items: htmlFiles.map(([, output]) => output), // TODO: need unix-like
        assets: assets
      }
    ],
    [
      path.join('EPUB', 'toc.ncx'),
      {
        title: config.title,
        creator: creator,
        toc,
        tocDepth
      }
    ],
    [
      path.join('EPUB', 'toc.xhtml'),
      {
        title: config.title,
        toc
      }
    ]
  ]

  // Copy required epub files.
  await Promise.all(
    epubFiles.map(([name, params = {}]) =>
      readFile(path.join(epubDataDir, name))
        .then(compile(params))
        .then(data =>
          writeFile(path.join(config.destination, 'epub', name), data)
        )
    )
  )

  // List of all epub files to zip.
  const files = [
    'mimetype',
    ...htmlFiles.map(([, name]) => `EPUB/${name}`),
    ...epubFiles.map(([name]) => name).filter(str => !/^mimetype$/.test(str))
  ]

  status('Generating book.epub')

  const output = path.join(config.destination, 'book.epub')

  // Generate the final EPUB file.
  await zip(output, path.join(config.destination, 'epub'), files)

  return output
}
