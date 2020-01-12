import visit from 'unist-util-visit'

export default function first (tree, test) {
  if (!test) {
    test = (_node, _index, parent) => parent
  }

  var result
  visit(tree, test, node => {
    result = node
    return visit.EXIT
  })
  return result
}
