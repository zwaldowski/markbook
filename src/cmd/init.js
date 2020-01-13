import inquirer from 'inquirer'
import path from 'path'
import init from '../book/init.js'
import { handleErrors } from '../common/errors.js'
import { status } from '../common/log.js'

/**
 * Create a new markbook.
 */
export default function (dir, { title, description, author } = {}) {
  const fulldir = path.resolve(dir || '.')
  if (dir) {
    status(`Creating new book in ${dir}`)
  } else {
    status('Creating new book in current dir')
  }

  const questions = []
    .concat(
      !title && {
        type: 'input',
        name: 'title',
        message: 'Enter book title:',
        validate: val => (val && val.length ? true : 'Must enter a book title')
      }
    )
    .concat(
      !description && {
        type: 'input',
        name: 'description',
        message: 'Enter book description:',
        validate: val =>
          val && val.length ? true : 'Must enter a book description'
      }
    )
    .concat(
      !author && {
        type: 'input',
        name: 'author',
        message: 'Enter author name:',
        validate: val =>
          val && val.length ? true : 'Must enter an author name'
      }
    )
    .filter(i => typeof i === 'object')

  return inquirer.prompt(questions).then(answers =>
    init(fulldir, {
      author,
      description,
      title,
      ...answers
    }).catch(handleErrors)
  )
}
