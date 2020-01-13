import { promises as fs } from 'fs'
import path from 'path'
import load from '../book/load.js'
import { handleErrors } from '../common/errors.js'
import { status } from '../common/log.js'

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
