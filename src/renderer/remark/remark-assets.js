import path from 'path'
import visit from 'unist-util-visit'
import '../../common/vfile'

const isOutside = (filepath, cwd) =>
  !path.resolve(cwd, filepath).startsWith(cwd)

export default function () {
  return (tree, file) => {
    file.data.assets = []
    visit(tree, 'image', node => {
      const source = path.join(file.dirname, node.url)
      file.assert(
        !isOutside(source, file.cwd),
        'Security error: Cannot traverse outside of output path',
        node
      )
      file.data.assets.push(source)
    })
  }
}
