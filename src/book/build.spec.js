/* global expect, fixtures */
import build from './build'

describe('book.build', () => {
  it.skip('should parse correctly', () => {
    const basic = fixtures('basic')
    expect(build(basic)).resolves.toBeUndefined()
  })
})
