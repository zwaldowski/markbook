import fs from 'fs'
import mkdir from 'make-dir'
import path from 'path'
import util from 'util'
import vfile from 'to-vfile'
import { reject } from './errors'

const readFileEx = util.promisify(fs.readFile)
const writeFileEx = util.promisify(fs.writeFile)
const readdirEx = util.promisify(fs.readdir)
const stat = util.promisify(fs.stat)

export const createPath = (...args) =>
  process.env.NODE_ENV === 'test'
    ? path.join('data', ...args)
    : path.resolve(__dirname, '..', 'data', ...args)

export const readFile = (filename, ...args) =>
  readFileEx(filename, ...args).catch(error =>
    reject(`Error reading ${filename}`, error)
  )

export const readVFile = filename =>
  vfile
    .read(filename)
    .catch(error => reject(`Error reading ${filename}`, error))

export const writeFile = (filename, ...args) =>
  mkdir(path.dirname(filename))
    .then(() => writeFileEx(filename, ...args))
    .catch(error => reject(`Error writing to ${filename}`, error))

export const readdir = dir =>
  readdirEx(dir)
    .then(subdirs =>
      Promise.all(
        subdirs.map(subdir => {
          const res = path.join(dir, subdir)
          return stat(res)
            .then(stats => stats.isDirectory())
            .then(ret => (ret ? readdir(res) : res))
        })
      )
    )
    .then(files => files.reduce((a, f) => a.concat(f), []))
