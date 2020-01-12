import visit from 'unist-util-visit'

export default function findAll (tree, options) {
  let { test, recursive = false } =
    typeof options === 'object' ? options : { test: options }

  if (!test) {
    test = (_node, _index, parent) => parent
  }

  var results = []
  visit(tree, test, node => {
    results.push(node)
    return recursive ? visit.CONTINUE : visit.SKIP
  })
  return results
}
