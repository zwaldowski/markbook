const locator = (value, fromIndex) => value.indexOf('(((', fromIndex)

function inlineTokenizer (eat, value) {
  const match = value.match(/^\(\(\((.*)\)\)\)\n/)
  if (!match) return
  return eat(match[0])
}

export default function () {
  const Parser = this.Parser
  const proto = Parser.prototype
  inlineTokenizer.locator = locator
  proto.inlineTokenizers.indexterm = inlineTokenizer
  proto.inlineMethods.splice(
    proto.inlineMethods.indexOf('text'),
    0,
    'indexterm'
  )
}
