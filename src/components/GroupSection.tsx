import { useState, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react'
import { Group, GroupWidth, Link } from '../types'
import { useClickOutside } from '../hooks/useClickOutside'
import { LinkCard } from './LinkCard'

type SortableHandle = Pick<ReturnType<typeof useSortable>, 'attributes' | 'listeners'>

interface GroupSectionProps {
  group: Group
  onAddLink: (groupId: string) => void
  onEditLink: (groupId: string, link: Link) => void
  onDeleteLink: (groupId: string, linkId: string) => void
  onRenameGroup: (group: Group) => void
  onDeleteGroup: (groupId: string) => void
  onSetWidth: (groupId: string, width: GroupWidth) => void
  activeId: string | null
}

const WIDTH_OPTIONS: { value: GroupWidth; label: string; title: string }[] = [
  { value: 'full',    label: '1',  title: 'Full width' },
  { value: 'half',   label: '½',  title: 'Half width' },
  { value: 'third',  label: '⅓',  title: 'One third' },
  { value: 'quarter',label: '¼',  title: 'One quarter' },
]

function GroupHeader({
  group,
  onRename,
  onDelete,
  onSetWidth,
  dragHandle,
}: {
  group: Group
  onRename: () => void
  onDelete: () => void
  onSetWidth: (width: GroupWidth) => void
  dragHandle: SortableHandle
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const currentWidth = group.width ?? 'full'

  useClickOutside(menuRef, () => {
    setMenuOpen(false)
    setShowConfirm(false)
  }, menuOpen)

  return (
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800 min-w-0">
      <div
        data-testid={`drag-${group.id}`}
        {...dragHandle.attributes}
        {...dragHandle.listeners}
        className="text-gray-700 hover:text-gray-500 cursor-grab active:cursor-grabbing transition-colors duration-100 flex-shrink-0"
      >
        <GripVertical size={16} />
      </div>
      <h2 className="flex-1 text-sm font-semibold text-gray-300 uppercase tracking-wider truncate min-w-0">
        {group.name}
      </h2>

      <div ref={menuRef} className="relative flex-shrink-0">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-gray-800 transition-colors duration-100"
          title="Group options"
        >
          <MoreHorizontal size={15} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1.5 z-50 w-44 rounded-xl border border-gray-700 bg-gray-900 shadow-xl shadow-black/60 overflow-hidden">
            {/* Width picker */}
            <div className="px-3 py-2.5 border-b border-gray-800">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Width</p>
              <div className="flex gap-1">
                {WIDTH_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { onSetWidth(opt.value); setMenuOpen(false) }}
                    title={opt.title}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors duration-100 ${
                      currentWidth === opt.value
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-1">
              <button
                onClick={() => { onRename(); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition-colors duration-100"
              >
                <Pencil size={13} className="text-gray-500" />
                Rename
              </button>
              {showConfirm ? (
                <div className="flex gap-1 p-1">
                  <button
                    onClick={() => { onDelete(); setMenuOpen(false) }}
                    className="flex-1 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 border border-red-500/30 transition-colors duration-100"
                  >
                    Confirm delete
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-800 transition-colors duration-100"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-100"
                >
                  <Trash2 size={13} />
                  Delete group
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function GroupSection({
  group,
  onAddLink,
  onEditLink,
  onDeleteLink,
  onRenameGroup,
  onDeleteGroup,
  onSetWidth,
  activeId,
}: GroupSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: group.id,
    data: { type: 'group', group },
  })

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `droppable-${group.id}`,
    data: { type: 'group', groupId: group.id },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const linkIds = group.links.map((l) => l.id)
  const isActiveLinkDragging = activeId !== null && activeId !== group.id
  const compact = group.width !== undefined && group.width !== 'full'

  return (
    <div ref={setSortableRef} style={style} data-testid={group.id}>
      <div
        ref={setDroppableRef}
        className={`
          p-5 rounded-2xl border transition-all duration-150
          ${isOver && isActiveLinkDragging
            ? 'border-indigo-500/50 bg-indigo-500/5'
            : 'border-gray-800 bg-gray-900/40'
          }
        `}
      >
        <GroupHeader
          group={group}
          onRename={() => onRenameGroup(group)}
          onDelete={() => onDeleteGroup(group.id)}
          onSetWidth={(width) => onSetWidth(group.id, width)}
          dragHandle={{ attributes, listeners }}
        />

        <SortableContext items={linkIds} strategy={rectSortingStrategy}>
          {compact ? (
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))' }}
            >
              {group.links.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  groupId={group.id}
                  onEdit={(l) => onEditLink(group.id, l)}
                  onDelete={(linkId) => onDeleteLink(group.id, linkId)}
                  compact
                />
              ))}
              <button
                onClick={() => onAddLink(group.id)}
                className="aspect-square flex items-center justify-center rounded-xl border border-dashed border-gray-700 text-gray-500 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all duration-150"
              >
                <Plus size={18} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {group.links.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  groupId={group.id}
                  onEdit={(l) => onEditLink(group.id, l)}
                  onDelete={(linkId) => onDeleteLink(group.id, linkId)}
                />
              ))}
              <button
                onClick={() => onAddLink(group.id)}
                className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-gray-700 text-gray-500 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all duration-150 min-h-[72px]"
              >
                <Plus size={15} />
                <span className="text-sm font-medium">Add link</span>
              </button>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
