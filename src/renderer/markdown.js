import bibliography from 'remark-bibliography'
import deflist from 'remark-deflist'
import frontmatter from 'remark-frontmatter'
import include from './remark/remark-include'
import math from 'remark-math'
import markdown from 'remark-parse'
import meta from 'remark-meta'
import plantuml from './remark/remark-plantuml'
import supersub from 'remark-supersub'
import unified from 'unified'
import yamlConfig from 'remark-yaml-config'
import copyAssets from './remark/remark-assets'


export const createParser = () =>
  unified()
    .use(markdown, {
      footnotes: true
    })
    .use(include)

export const createFormatter = (config) =>
  createParser()
    .use(frontmatter)
    .use(yamlConfig)
    .use(math)
    .use(deflist)
    .use(plantuml)
    .use(supersub)
    .use(meta)
    .use(bibliography)
    .use(copyAssets, config)
