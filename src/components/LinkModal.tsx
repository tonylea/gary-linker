import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Link } from '../types'
import { normalizeUrl } from '../lib/url'
import { validateLinkForm } from '../lib/validation'

interface LinkModalProps {
  groupId: string
  link?: Link | null
  onSave: (groupId: string, link: Omit<Link, 'id'>, existingId?: string) => void
  onClose: () => void
}

export function LinkModal({ groupId, link, onSave, onClose }: LinkModalProps) {
  const [name, setName] = useState(link?.name ?? '')
  const [url, setUrl] = useState(link?.url ?? '')
  const [description, setDescription] = useState(link?.description ?? '')
  const [icon, setIcon] = useState(link?.icon ?? '')
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({})

  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSave = () => {
    const errs = validateLinkForm({ name, url })
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    onSave(
      groupId,
      {
        name: name.trim(),
        url: normalizeUrl(url),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
      },
      link?.id
    )
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">
            {link ? 'Edit Link' : 'Add Link'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors duration-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }))
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. GitHub"
              className={`
                w-full px-3 py-2.5 rounded-xl bg-gray-800 border text-sm text-white placeholder-gray-600
                focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors duration-100
                ${errors.name ? 'border-red-500' : 'border-gray-700 focus:border-indigo-500'}
              `}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              URL <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (errors.url) setErrors((p) => ({ ...p, url: undefined }))
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. https://github.com"
              className={`
                w-full px-3 py-2.5 rounded-xl bg-gray-800 border text-sm text-white placeholder-gray-600
                focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors duration-100
                ${errors.url ? 'border-red-500' : 'border-gray-700 focus:border-indigo-500'}
              `}
            />
            {errors.url && (
              <p className="mt-1 text-xs text-red-400">{errors.url}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Description
              <span className="text-gray-600 ml-1 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Short description"
              className="
                w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-600
                focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-100
              "
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Icon emoji
              <span className="text-gray-600 ml-1 font-normal">(optional — uses favicon if blank)</span>
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 🚀"
              maxLength={4}
              className="
                w-24 px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-600
                focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-100
              "
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors duration-100"
          >
            {link ? 'Save changes' : 'Add link'}
          </button>
        </div>
      </div>
    </div>
  )
}
