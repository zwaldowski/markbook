import visit from 'unist-util-visit'

export default function mapFirst (tree, test, visitor) {
  if (typeof test === 'function' && typeof visitor !== 'function') {
    visitor = test
    test = null
  }

  var result
  visit(tree, test, (node, index, parent) => {
    result = visitor ? visitor(node, index, parent) : node
    return visit.EXIT
  })
  return result
}
