import frontmatter from 'remark-frontmatter'
import meta from 'remark-meta'
import markdown from 'remark-parse'
import supersub from 'remark-supersub'
import indexterm from './remark/remark-indexterm'

export default [
  [
    markdown,
    {
      commonmark: true,
      footnotes: true,
      fences: true,
      listItemIndent: '1',
      rule: '-',
      ruleSpaces: false
    }
  ],
  frontmatter,
  supersub,
  indexterm,
  meta
]
