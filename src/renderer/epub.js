/**
 * Create an ePub file.
 */
import archiver from 'archiver'
import epub from './remark/remark-epub'
import fs from 'fs'
import Handlebars from 'handlebars'
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
    files.forEach(name => {
      const file = path.join(dir, name)
      archive.file(file, { name })
    })
    archive.finalize()
  })

export default async function (config) {
  const epubDataDir = createPath('epub')
  const epubFilename = path.join(epubDataDir, 'epub.hbs')
  const processor = createProcessor(config)
  const compile = params => data => Handlebars.compile(data.toString())(params)

  const epubTemplate = await readFile(epubFilename).then(data =>
    Handlebars.compile(data.toString())
  )

  // Create list of XHTML files to generate.
  const htmlFiles = [
    ...config.summary.prefix,
    ...config.summary.chapters,
    ...config.summary.suffix
  ].map(({ url }) => [
    path.join(config.source, url),
    url
      .split(path.sep)
      .join('-')
      .replace(/README\.md$/, 'index.md')
      .replace(/\.md$/, '')
      .concat('.xhtml')
  ])

  // Create Table of Contents
  const toc = [
    ...config.summary.prefix,
    ...config.summary.chapters,
    ...config.summary.suffix
  ].map(({ title, url }, i) => ({
    title,
    url: url
      .split(path.sep)
      .join('-')
      .replace(/README\.md$/, 'index.md')
      .replace(/\.md$/, '')
      .concat('.xhtml'),
    i: i + 1
  }))

  // Render and copy all XHTML files.
  await Promise.all(
    htmlFiles.map(([input, output]) =>
      readVFile(input)
        .then(processor.process)
        .then(content => {
          const epub = path.join(config.destination, 'epub', 'EPUB', output)
          const data = epubTemplate({
            title: config.title,
            content
          })

          status(`Writing ${output}`)

          return writeFile(epub, data)
        })
    )
  )

  // List of epub data files
  const epubFiles = [
    ['mimetype'],
    [path.join('META-INF', 'container.xml')],
    [
      path.join('EPUB', 'content.opf'),
      {
        title: config.title,
        language: 'en-US',
        creator: 'Me',
        description: 'Brief Description',
        items: htmlFiles.map(([, output]) => output) // TODO: need unix-like
      }
    ],
    [
      path.join('EPUB', 'toc.ncx'),
      {
        title: config.title,
        creator: 'Me',
        toc
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
