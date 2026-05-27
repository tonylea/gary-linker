import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

interface GroupModalProps {
  initialName?: string
  onSave: (name: string) => void
  onClose: () => void
}

export function GroupModal({ initialName = '', onSave, onClose }: GroupModalProps) {
  const [name, setName] = useState(initialName)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSave = () => {
    if (!name.trim()) {
      setError('Group name is required')
      return
    }
    onSave(name.trim())
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }

  const isEditing = Boolean(initialName)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">
            {isEditing ? 'Rename Group' : 'New Group'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors duration-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Group name <span className="text-red-400">*</span>
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError('')
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Development"
            className={`
              w-full px-3 py-2.5 rounded-xl bg-gray-800 border text-sm text-white placeholder-gray-600
              focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors duration-100
              ${error ? 'border-red-500' : 'border-gray-700 focus:border-indigo-500'}
            `}
          />
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-800">
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
            {isEditing ? 'Rename' : 'Create group'}
          </button>
        </div>
      </div>
    </div>
  )
}
