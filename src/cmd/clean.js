import { promises as fs } from 'fs'
import path from 'path'
import { handleErrors } from '../common/errors'
import load from '../book/load'
import { status } from '../common/log'

/**
 * Remove the destination directory.
 */
export default function (dir) {
  const fulldir = path.resolve(dir || '.')
  if (dir) {
    status('Cleaning %s', dir)
  } else {
    status('Cleaning default dir')
  }

  return load(fulldir)
    .then(({ destination }) => fs.rmdir(destination, { recursive: true }))
    .catch(handleErrors)
}
