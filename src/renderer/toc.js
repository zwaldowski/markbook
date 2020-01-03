const getURL = filename =>
  filename
    .replace(/README\.md$/, 'index.md')
    .replace(/\.md$/, '')
    .concat('.html')

const toTOC = item => ({
  title: item.title,
  url: getURL(item.url),
  ch: item.type === 'bodymatter' ? item.numbering.join('.') : null,
  children: item.children ? item.children.map(toTOC) : null
})

export default function createToc (config) {
  return config.summary.contents.children.map(toTOC)
}
