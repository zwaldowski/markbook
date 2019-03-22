import unified from 'unified'
import markdown from 'remark-parse'
import { Parser as english } from 'retext-english'
import remark2retext from 'remark-retext'
import text from 'retext-stringify'
import path from 'path'
import { readVFile, writeFile } from '../common/files'

const template = data => `// Autogenerated. Do not edit.
var data = ${JSON.stringify(data)};
var fuse = new Fuse(data, {
  includeMatches: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 3,
  keys: [ 'contents' ]
});
`

export default function search(config) {
  const files = [
    ...config.summary.prefix,
    ...config.summary.chapters,
    ...config.summary.suffix
  ]

  const processor = unified()
    .use(markdown)
    .use(remark2retext, english)
    .use(text)

  const cb = file => {
    const input = path.join(config.source, file.url)
    return readVFile(input)
      .then(processor.process)
      .then(data => ({
        file: file.url,
        contents: data.toString()
      }))
  }

  const output = path.join(config.destination, 'search.js')

  return Promise.all(files.map(cb)).then(data =>
    writeFile(output, template(data))
  )
}
