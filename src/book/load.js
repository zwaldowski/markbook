import cosmiconfig from 'cosmiconfig'
import fs from 'fs'
import util from 'util'
import { reject } from '../common/errors.js'
import summary from './summary.js'
import config from './config.js'

const stat = util.promisify(fs.stat)

const check = dir =>
  stat(dir)
    .catch(error => reject(`${dir} not found`, error))
    .then(stats =>
      stats.isDirectory() ? dir : reject(`${dir} is not a directory`)
    )

/**
 * Load the configuration for a book.
 * @param {!string} dir Full path to book directory.
 * @return {BookConfig} Config object.
 */
export default function load (dir) {
  const explorer = cosmiconfig('markbook', {
    searchPlaces: ['markbook.yml', 'markbook.yaml', 'markbook.json']
  })
  return check(dir)
    .then(dir => explorer.search(dir))
    .then(config)
    .then(summary)
}
