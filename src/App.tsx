import { useState, useCallback } from 'react'
import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus, Link2, Download, Upload } from 'lucide-react'
import { useStore } from './hooks/useStore'
import { GroupSection } from './components/GroupSection'
import { LinkCardOverlay } from './components/LinkCard'
import { LinkModal } from './components/LinkModal'
import { GroupModal } from './components/GroupModal'
import { resolveDrop, ActiveData, OverData } from './store/resolveDrop'
import { googleSearchUrl } from './lib/url'
import { Group, Link } from './types'

type ActiveItem =
  | { type: 'group'; group: Group }
  | { type: 'link'; link: Link; groupId: string }
  | null

// When dragging a group, restrict collisions to group sortables. Otherwise the
// target's link cards sit closest to the dragged group's rect and win, so the
// drop never lands on a group and reordering silently fails.
const collisionDetection: CollisionDetection = (args) => {
  if (args.active.data.current?.type === 'group') {
    const groupSortables = args.droppableContainers.filter(
      (c) => c.data.current?.type === 'group' && 'group' in c.data.current
    )
    return closestCorners({ ...args, droppableContainers: groupSortables })
  }
  return closestCorners(args)
}

interface LinkModalState {
  groupId: string
  link?: Link
}

interface GroupModalState {
  group?: Group
}

export default function App() {
  const {
    groups,
    addGroup,
    renameGroup,
    deleteGroup,
    addLink,
    updateLink,
    deleteLink,
    reorderLinks,
    moveLinkToGroup,
    reorderGroups,
    setGroupWidth,
    importGroups,
  } = useStore()

  const handleExport = useCallback(() => {
    const json = JSON.stringify(groups, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `linker-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [groups])

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (!Array.isArray(parsed)) throw new Error('Invalid format')
        if (window.confirm(`Replace all current links with the backup? (${parsed.length} group${parsed.length !== 1 ? 's' : ''})`)) {
          importGroups(parsed)
        }
      } catch {
        alert('Could not read the file — make sure it\'s a valid Linker backup.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [importGroups])

  const [activeItem, setActiveItem] = useState<ActiveItem>(null)
  const [linkModal, setLinkModal] = useState<LinkModalState | null>(null)
  const [groupModal, setGroupModal] = useState<GroupModalState | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const data = active.data.current

    if (data?.type === 'group') {
      setActiveItem({ type: 'group', group: data.group as Group })
    } else if (data?.type === 'link') {
      const link = data.link as Link
      const ownerGroup = groups.find((g) => g.links.some((l) => l.id === link.id))
      if (ownerGroup) {
        setActiveItem({ type: 'link', link, groupId: ownerGroup.id })
      }
    }
  }, [groups])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)

    const action = resolveDrop(
      groups,
      { id: active.id as string, data: active.data.current as ActiveData },
      over ? { id: over.id as string, data: over.data.current as OverData } : null
    )
    if (!action) return

    switch (action.kind) {
      case 'reorder-groups':
        return reorderGroups(action.fromIndex, action.toIndex)
      case 'reorder-links':
        return reorderLinks(action.groupId, action.fromIndex, action.toIndex)
      case 'move-link':
        return moveLinkToGroup(action.fromGroupId, action.toGroupId, action.linkId, action.toIndex)
    }
  }, [groups, reorderGroups, reorderLinks, moveLinkToGroup])

  // Modal handlers
  const handleOpenAddLink = useCallback((groupId: string) => {
    setLinkModal({ groupId })
  }, [])

  const handleOpenEditLink = useCallback((groupId: string, link: Link) => {
    setLinkModal({ groupId, link })
  }, [])

  const handleSaveLink = useCallback(
    (groupId: string, linkData: Omit<Link, 'id'>, existingId?: string) => {
      if (existingId) {
        updateLink(groupId, { ...linkData, id: existingId })
      } else {
        addLink(groupId, linkData)
      }
    },
    [addLink, updateLink]
  )

  const handleOpenAddGroup = useCallback(() => {
    setGroupModal({})
  }, [])

  const handleOpenRenameGroup = useCallback((group: Group) => {
    setGroupModal({ group })
  }, [])

  const handleSaveGroup = useCallback(
    (name: string) => {
      if (groupModal?.group) {
        renameGroup(groupModal.group.id, name)
      } else {
        addGroup(name)
      }
    },
    [groupModal, addGroup, renameGroup]
  )

  const groupIds = groups.map((g) => g.id)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f1117' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-800/60 backdrop-blur-md" style={{ backgroundColor: 'rgba(15,17,23,0.85)' }}>
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Link2 size={15} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Gary Linker</span>
          </div>

          <input
            type="search"
            placeholder="Google search..."
            className="flex-1 bg-gray-800/70 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:bg-gray-800 transition-colors duration-150"
            onKeyDown={(e) => {
              const query = e.currentTarget.value.trim()
              if (e.key === 'Enter' && query) {
                window.location.href = googleSearchUrl(query)
                e.currentTarget.value = ''
              }
            }}
          />

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleExport}
              title="Export backup"
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-150"
            >
              <Download size={17} />
            </button>
            <label
              title="Import backup"
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
            >
              <Upload size={17} />
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            <button
              onClick={handleOpenAddGroup}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors duration-150"
            >
              <Plus size={15} />
              <span>Add Group</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <Link2 size={28} className="text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No groups yet</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              Create your first group to start organizing your links.
            </p>
            <button
              onClick={handleOpenAddGroup}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors duration-150"
            >
              <Plus size={15} />
              <span>Create first group</span>
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={groupIds} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-12 gap-6 items-start">
                {groups.map((group) => {
                  const colSpan = {
                    full:    'col-span-12',
                    half:    'col-span-12 md:col-span-6',
                    third:   'col-span-12 md:col-span-4',
                    quarter: 'col-span-12 md:col-span-3',
                  }[group.width ?? 'full']
                  return (
                    <div key={group.id} className={colSpan}>
                      <GroupSection
                        group={group}
                        onAddLink={handleOpenAddLink}
                        onEditLink={handleOpenEditLink}
                        onDeleteLink={deleteLink}
                        onRenameGroup={handleOpenRenameGroup}
                        onDeleteGroup={deleteGroup}
                        onSetWidth={setGroupWidth}
                        activeId={activeItem?.type === 'link' ? activeItem.link.id : activeItem?.type === 'group' ? activeItem.group.id : null}
                      />
                    </div>
                  )
                })}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={{
              duration: 200,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
              {activeItem?.type === 'link' && (
                <LinkCardOverlay link={activeItem.link} />
              )}
              {activeItem?.type === 'group' && (
                <div className="p-5 rounded-2xl border border-indigo-500/40 bg-gray-900/80 shadow-2xl shadow-black/60 opacity-90">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-700">
                    <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      {activeItem.group.name}
                    </span>
                    <span className="text-xs text-gray-600 ml-auto">
                      {activeItem.group.links.length} link{activeItem.group.links.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 opacity-50">
                    {activeItem.group.links.slice(0, 4).map((link) => (
                      <div key={link.id} className="h-10 rounded-lg bg-gray-800 border border-gray-700" />
                    ))}
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {/* Link Modal */}
      {linkModal && (
        <LinkModal
          groupId={linkModal.groupId}
          link={linkModal.link}
          onSave={handleSaveLink}
          onClose={() => setLinkModal(null)}
        />
      )}

      {/* Group Modal */}
      {groupModal !== null && (
        <GroupModal
          initialName={groupModal.group?.name}
          onSave={handleSaveGroup}
          onClose={() => setGroupModal(null)}
        />
      )}
    </div>
  )
}
