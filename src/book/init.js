import assert from 'assert'
import { v4 as uuid } from 'uuid'
import { status } from '../common/log'
import { yamlFile } from '../common/templating'

const makeConfig = ({ title, description, author }) =>
  yamlFile('markbook', {
    identifier: uuid(),
    title,
    description,
    authors: [author]
  })

const makeSummary = ({ title }) => `
# Summary

- [${title}](README.md)

* [First Chapter](chapter-1.md)

`

const makeReadMe = ({ title }) => `
# ${title}

This is your book.
`

const makeFirstChapter = () => `
# First Chapter

This is the first chapter.
`

/**
 * Create a new book.
 * @param {!string} dir Path to create a new book in.
 */
export default async function init (dir, { title, description, author } = {}) {
  assert(title, 'Missing "title" field')
  assert(description, 'Missing "description" field')
  assert(author, 'Missing "author" field')

  const files = [
    makeConfig({ title, description, author }),
    makeSummary({ title }),
    makeReadMe({ title }),
    makeFirstChapter()
  ]

  await Promise.all(
    files.map(file => {
      file.cwd = dir
      return file.write()
    })
  )

  status('Finished')
}
