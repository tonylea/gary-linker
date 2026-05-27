import { describe, expect, it } from 'vitest'
import { validateLinkForm } from './validation'

describe('validateLinkForm', () => {
  it('returns no errors for a valid name and url', () => {
    expect(validateLinkForm({ name: 'GitHub', url: 'github.com' })).toEqual({})
  })

  it('flags a missing name', () => {
    expect(validateLinkForm({ name: '   ', url: 'github.com' })).toEqual({
      name: 'Name is required',
    })
  })

  it('flags a missing url', () => {
    expect(validateLinkForm({ name: 'GitHub', url: '' })).toEqual({
      url: 'URL is required',
    })
  })

  it('flags an unparseable url', () => {
    expect(validateLinkForm({ name: 'GitHub', url: 'http://' })).toEqual({
      url: 'Enter a valid URL',
    })
  })

  it('reports both fields when both are invalid', () => {
    expect(validateLinkForm({ name: '', url: '' })).toEqual({
      name: 'Name is required',
      url: 'URL is required',
    })
  })
})
