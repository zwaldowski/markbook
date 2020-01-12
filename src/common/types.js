export default {
  dc: {
    'xmlns:dc': 'http://purl.org/dc/elements/1.1/'
  },
  epub: {
    mediaType: 'application/epub+zip'
  },
  ncx: {
    mediaType: 'application/x-dtbncx+xml',
    xmlns: 'http://www.daisy.org/z3986/2005/ncx/',
    version: '2005-1'
  },
  ocf: {
    identifier: {
      xmlns: 'urn:oasis:names:tc:opendocument:xmlns:container',
      version: '1.0'
    }
  },
  opf: {
    mediaType: 'application/oebps-package+xml',
    xmlns: 'http://www.idpf.org/2007/opf',
    version: '3.0'
  },
  ops: {
    'xmlns:epub': 'http://www.idpf.org/2007/ops'
  },
  xhtml: {
    mediaType: 'application/xhtml+xml',
    xmlns: 'http://www.w3.org/1999/xhtml'
  }
}
