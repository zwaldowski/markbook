import { promises as fs } from 'fs'
import path from 'path'
import vfile from 'to-vfile'
import { reject } from './errors'

export const createPath = (...args) =>
  process.env.NODE_ENV === 'test'
    ? path.join('data', ...args)
    : path.resolve(__dirname, '..', 'data', ...args)

export const readFile = (filename, ...args) =>
  fs
    .readFile(filename, ...args)
    .catch(error => reject(`Error reading ${filename}`, error))

export const readVFile = filename =>
  vfile
    .read(filename)
    .catch(error => reject(`Error reading ${filename}`, error))

export const writeFile = (filename, ...args) =>
  fs
    .mkdir(path.dirname(filename), { recursive: true })
    .then(() => fs.writeFile(filename, ...args))
    .catch(error => reject(`Error writing to ${filename}`, error))

export const readdir = dir =>
  fs
    .readdir(dir)
    .then(subdirs =>
      Promise.all(
        subdirs.map(subdir => {
          const res = path.join(dir, subdir)
          return fs
            .stat(res)
            .then(stats => stats.isDirectory())
            .then(ret => (ret ? readdir(res) : res))
        })
      )
    )
    .then(files => files.reduce((a, f) => a.concat(f), []))
