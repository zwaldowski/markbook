import visit from 'unist-util-visit'
import path from 'path'
import assert from 'assert'
import { promises as fs } from 'fs'

export default function ({ source, destination } = {}) {
  return async function transform (tree, vfile) {
    var nodes = []
    visit(tree, 'image', node => nodes.push(node))

    const rootToImagePath = path.relative(source, vfile.dirname)
    await Promise.all(
      nodes.map(async node => {
        const input = path.join(source, rootToImagePath, node.url)
        const output = path.join(destination, rootToImagePath, node.url)
        assert(
          output.startsWith(destination),
          'Security error: Cannot traverse outside of output path'
        )
        await fs.mkdir(path.dirname(output), { recursive: true })
        await fs.copyFile(input, output)
        node.url = path.join(rootToImagePath, node.url)
      })
    )

    return tree
  }
}
