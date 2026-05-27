import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Link } from '../types'
import { useClickOutside } from '../hooks/useClickOutside'
import { getDomain, getFaviconUrl } from '../lib/url'

interface LinkCardProps {
  link: Link
  groupId: string
  onEdit: (link: Link) => void
  onDelete: (linkId: string) => void
  compact?: boolean
}

function LinkIcon({ link, compact = false }: { link: Link; compact?: boolean }) {
  const [imgError, setImgError] = useState(false)

  if (link.icon) {
    return (
      <span className={compact ? 'text-3xl leading-none' : 'text-xl leading-none'}>
        {link.icon}
      </span>
    )
  }
  if (!imgError) {
    return (
      <img
        src={getFaviconUrl(link.url)}
        alt=""
        className={compact ? 'w-9 h-9 object-contain' : 'w-6 h-6 object-contain'}
        onError={() => setImgError(true)}
      />
    )
  }
  return (
    <span className={`text-gray-400 font-bold uppercase ${compact ? 'text-xl' : 'text-xs'}`}>
      {link.name.charAt(0)}
    </span>
  )
}

function LinkMenu({
  onEdit,
  onDelete,
  menuRef,
  menuOpen,
  setMenuOpen,
  showConfirm,
  setShowConfirm,
}: {
  onEdit: () => void
  onDelete: () => void
  menuRef: React.RefObject<HTMLDivElement>
  menuOpen: boolean
  setMenuOpen: (v: boolean) => void
  showConfirm: boolean
  setShowConfirm: (v: boolean) => void
}) {
  return (
    <div ref={menuRef} className="relative" data-no-nav>
      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
        className="p-1 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-700/80 transition-colors duration-100"
        title="Link options"
      >
        <MoreHorizontal size={13} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-xl border border-gray-700 bg-gray-900 shadow-xl shadow-black/60 overflow-hidden">
          <div className="p-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); setMenuOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition-colors duration-100"
            >
              <Pencil size={12} className="text-gray-500" />
              Edit
            </button>
            {showConfirm ? (
              <div className="flex gap-1 p-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); setMenuOpen(false) }}
                  className="flex-1 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 border border-red-500/30 transition-colors duration-100"
                >
                  Confirm
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowConfirm(false) }}
                  className="px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-800 transition-colors duration-100"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setShowConfirm(true) }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-100"
              >
                <Trash2 size={12} />
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function LinkCard({ link, onEdit, onDelete, compact = false }: LinkCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showDesc, setShowDesc] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const descTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (descTimer.current) clearTimeout(descTimer.current) }
  }, [])

  const handleMouseEnter = () => {
    if (!compact || !link.description) return
    descTimer.current = setTimeout(() => setShowDesc(true), 1500)
  }

  const handleMouseLeave = () => {
    if (descTimer.current) clearTimeout(descTimer.current)
    setShowDesc(false)
  }

  useClickOutside(menuRef, () => {
    setMenuOpen(false)
    setShowConfirm(false)
  }, menuOpen)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: link.id, data: { type: 'link', link } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  }

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-nav]')) return
    window.location.href = link.url
  }

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        data-testid={link.id}
        className="group relative aspect-square flex items-center justify-center rounded-xl cursor-pointer bg-gray-900 border border-gray-800 hover:border-gray-600 hover:bg-gray-800/70 transition-all duration-150"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          data-no-nav
          data-testid={`drag-${link.id}`}
          {...attributes}
          {...listeners}
          className="absolute top-1.5 left-1.5 text-gray-700 hover:text-gray-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={12} />
        </div>

        <LinkIcon link={link} compact />

        {/* Name tooltip — instant */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 shadow-xl whitespace-nowrap">
            <p className="text-xs text-white font-medium">{link.name}</p>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700" />
        </div>

        {/* Description tooltip — delayed */}
        {showDesc && link.description && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 pointer-events-none">
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-700" />
            <div className="bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 shadow-xl max-w-[180px]">
              <p className="text-xs text-gray-300 text-center leading-snug">{link.description}</p>
            </div>
          </div>
        )}

        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
          <LinkMenu
            onEdit={() => onEdit(link)}
            onDelete={() => onDelete(link.id)}
            menuRef={menuRef}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            showConfirm={showConfirm}
            setShowConfirm={setShowConfirm}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={link.id}
      className="group relative flex items-start gap-3 p-4 rounded-xl cursor-pointer bg-gray-900 border border-gray-800 hover:border-gray-600 hover:bg-gray-800/70 transition-all duration-150 ease-in-out"
      onClick={handleClick}
    >
      <div
        data-no-nav
        data-testid={`drag-${link.id}`}
        {...attributes}
        {...listeners}
        className="flex-shrink-0 mt-0.5 text-gray-700 hover:text-gray-400 cursor-grab active:cursor-grabbing transition-colors duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={16} />
      </div>

      <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 border border-gray-700 overflow-hidden">
        <LinkIcon link={link} />
      </div>

      <div className="flex-1 min-w-0 pr-6">
        <p className="font-semibold text-white text-sm leading-tight truncate">{link.name}</p>
        {link.description && (
          <p className="text-gray-400 text-xs mt-0.5 leading-snug line-clamp-2">{link.description}</p>
        )}
        <p className="text-gray-600 text-xs mt-1 truncate">{getDomain(link.url)}</p>
      </div>

      {/* Menu */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <LinkMenu
          onEdit={() => onEdit(link)}
          onDelete={() => onDelete(link.id)}
          menuRef={menuRef}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          showConfirm={showConfirm}
          setShowConfirm={setShowConfirm}
        />
      </div>
    </div>
  )
}

export function LinkCardOverlay({ link }: { link: Link }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-800 border border-indigo-500/60 shadow-2xl shadow-black/60 w-64">
      <div className="flex-shrink-0 mt-0.5 text-gray-500">
        <GripVertical size={16} />
      </div>
      <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-gray-700 border border-gray-600 overflow-hidden">
        <LinkIcon link={link} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm leading-tight truncate">{link.name}</p>
        {link.description && (
          <p className="text-gray-400 text-xs mt-0.5 leading-snug line-clamp-1">{link.description}</p>
        )}
      </div>
    </div>
  )
}
