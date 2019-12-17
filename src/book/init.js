import { createPath, readdir, readFile, writeFile } from '../common/files'
import path from 'path'
import { reject } from '../common/errors'
import { status } from '../common/log'
import { v4 as uuid } from 'uuid'

const copy = (identifier, author, desc, theme, title, origin, dir, file) => {
  const replace = data =>
    data
      .toString()
      .replace(/@IDENTIFIER@/g, identifier)
      .replace(/@TITLE@/g, title)
      .replace(/@DESC@/g, desc)
      .replace(/@AUTHOR@/g, author)
      .replace(/@THEME@/g, theme ? 'theme: "theme"' : '')
      .replace(/\n\n/g, '\n')

  const name = path.relative(origin, file)
  const output = path.join(dir, name)

  return readFile(file).then(data => writeFile(output, replace(data)))
}

/**
 * Create a new book.
 * @param {!string} dir Path to create a new book in.
 */
export default function init (dir, { author, desc, theme, title } = {}) {
  const identifier = uuid()
  if (!author) {
    return reject('Missing "author" field')
  } else if (!desc) {
    return reject('Missing "desc" field')
  } else if (!title) {
    return reject('Missing "title" field')
  }

  const defaultDir = createPath('default')
  const themeDir = createPath('theme')

  const args = [identifier, author, desc, theme, title]

  const copyFiles = () =>
    readdir(defaultDir).then(files =>
      Promise.all(files.map(file => copy(...args, defaultDir, dir, file)))
    )

  const copyTheme = () =>
    theme
      ? readdir(themeDir).then(files =>
          Promise.all(
            files.map(file =>
              copy(...args, themeDir, path.join(dir, 'theme'), file)
            )
          )
        )
      : Promise.resolve()

  return Promise.all([copyFiles(), copyTheme()]).then(() => status('Finished'))
}
