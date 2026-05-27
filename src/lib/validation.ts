import { isValidUrl } from './url'

export interface LinkFormInput {
  name: string
  url: string
}

export interface LinkFormErrors {
  name?: string
  url?: string
}

export function validateLinkForm({ name, url }: LinkFormInput): LinkFormErrors {
  const errors: LinkFormErrors = {}
  if (!name.trim()) errors.name = 'Name is required'
  if (!url.trim()) errors.url = 'URL is required'
  else if (!isValidUrl(url)) errors.url = 'Enter a valid URL'
  return errors
}
