/**
 * Generate an ePub 3.0 document.
 */

import open from 'open'
import path from 'path'
import load from '../book/load.js'
import { handleErrors } from '../common/errors.js'
import { status } from '../common/log.js'
import epub from '../renderer/epub.js'

export default function (dir, { open: shouldOpen = false } = {}) {
  const fulldir = path.resolve(dir || '.')
  if (dir) {
    status(`Creating in ${dir}`)
  } else {
    status('Creating in default dir')
  }

  if (shouldOpen) {
    status('Opening in default viewer')
  }

  return load(fulldir)
    .then(epub)
    .then(path => shouldOpen && open(path))
    .catch(handleErrors)
}
