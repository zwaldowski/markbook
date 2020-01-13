import h from 'hastscript'
import html from 'rehype-stringify'
import unified from 'unified'
import u from 'unist-builder'
import x from 'xastscript'
import toXML from 'xast-util-to-xml'
import YAML from 'yaml'
import html5Only from './rehype/rehype-xhtml.js'
import VFile from '../common/vfile.js'

export { h, u, x }

const fileFromTree = (path, extname, contents, processor) => {
  const file = new VFile({ path })
  const tree = processor.runSync ? processor.runSync(contents, file) : contents
  file.contents = processor.stringify(tree, file)
  if (!file.extname) {
    file.extname = `.${extname}`
  }
  return file
}

export const yamlFile = (path, contents) =>
  fileFromTree(path, 'yml', contents, YAML)

export const textFile = (path, contents) => new VFile({ path, contents })

export const xhtml = [
  html5Only,
  [
    html,
    {
      upperDoctype: true,
      closeSelfClosing: true,
      closeEmptyElements: true
    }
  ]
]

const xhtmlProcessor = unified().use(xhtml)

export const xhtmlFile = (path, children) =>
  fileFromTree(
    path,
    'xhtml',
    u('root', [u('doctype', { name: 'html' }), ...children]),
    xhtmlProcessor
  )

export function xml (config) {
  const settings = { ...config, ...this.data.settings }
  this.Compiler = tree => toXML(tree, settings)
}

const xmlProcessor = unified().use(xml, {
  closeEmptyElements: true
})

export const xmlFile = (path, root) =>
  fileFromTree(
    path,
    'xml',
    u('root', [
      u('instruction', { name: 'xml' }, 'version="1.0" encoding="UTF-8"'),
      root
    ]),
    xmlProcessor
  )
