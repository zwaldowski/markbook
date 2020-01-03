/**
 * Generate an ePub 3.0 document.
 */

import path from 'path'
import load from '../book/load'
import epub from '../renderer/epub'
import { handleErrors } from '../common/errors'
import { status } from '../common/log'
import open from 'open'

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
