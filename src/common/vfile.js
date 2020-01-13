import { promises as fs } from 'fs'
import path from 'path'
import VFile from 'vfile'
import { reject } from './errors.js'

export default VFile

VFile.prototype.assert = function (value, ...args) {
  if (value) {
    return
  }
  this.fail(...args)
}

VFile.prototype.read = async function (...args) {
  if (this.contents) {
    return
  }

  const filePath = path.resolve(this.cwd, this.path)
  this.contents = await fs
    .readFile(filePath, ...args)
    .catch(error => reject(`Error reading ${this.path}`, error))
}

VFile.prototype.write = async function (...args) {
  const dirPath = path.resolve(this.cwd, this.dirname)
  await fs.mkdir(dirPath, { recursive: true })

  const filePath = path.resolve(this.cwd, this.path)
  await fs
    .writeFile(filePath, this.toString(), ...args)
    .catch(error => reject(`Error writing to ${this.path}`, error))
}
