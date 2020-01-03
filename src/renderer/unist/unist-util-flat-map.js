import visit from 'unist-util-visit'

export default function flatMap (tree, test, visitor, deep = true) {
  if (typeof test === 'function' && typeof visitor !== 'function') {
    visitor = test
    test = null
  }

  if (!test) {
    test = node => node.type !== 'root'
  }

  var results = []
  visit(tree, test, (node, index, parent) => {
    results.push(visitor(node, index, parent))
    return deep ? visit.CONTINUE : visit.SKIP
  })
  return results
}
