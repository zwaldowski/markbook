import frontmatter from 'remark-frontmatter'
import markdown from 'remark-parse'
import meta from 'remark-meta'
import supersub from 'remark-supersub'
import unified from 'unified'
import yamlConfig from 'remark-yaml-config'
import copyAssets from './remark/remark-assets'
import indexterm from './remark/remark-indexterm'

export const createParser = () =>
  unified().use(markdown, {
    footnotes: true
  })

export const createFormatter = config =>
  createParser()
    .use(frontmatter)
    .use(yamlConfig)
    .use(supersub)
    .use(indexterm)
    .use(meta)
    .use(copyAssets, config)
