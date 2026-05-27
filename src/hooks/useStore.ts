import { useState, useEffect, useCallback } from 'react'
import { Group, GroupWidth, Link } from '../types'

const STORAGE_KEY = 'linker-data'

function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

const SEED_DATA: Group[] = [
  {
    id: 'group-dev',
    name: 'Development',
    links: [
      {
        id: 'link-gh',
        name: 'GitHub',
        url: 'https://github.com',
        description: 'Code hosting and collaboration',
        icon: undefined,
      },
      {
        id: 'link-mdn',
        name: 'MDN Web Docs',
        url: 'https://developer.mozilla.org',
        description: 'Web platform documentation',
        icon: undefined,
      },
      {
        id: 'link-vite',
        name: 'Vite',
        url: 'https://vitejs.dev',
        description: 'Next generation frontend tooling',
        icon: '⚡',
      },
      {
        id: 'link-tw',
        name: 'Tailwind CSS',
        url: 'https://tailwindcss.com',
        description: 'Utility-first CSS framework',
        icon: '🌊',
      },
    ],
  },
  {
    id: 'group-tools',
    name: 'Productivity',
    links: [
      {
        id: 'link-notion',
        name: 'Notion',
        url: 'https://notion.so',
        description: 'All-in-one workspace',
        icon: undefined,
      },
      {
        id: 'link-linear',
        name: 'Linear',
        url: 'https://linear.app',
        description: 'Issue tracking for modern teams',
        icon: undefined,
      },
      {
        id: 'link-figma',
        name: 'Figma',
        url: 'https://figma.com',
        description: 'Collaborative design tool',
        icon: '🎨',
      },
      {
        id: 'link-vercel',
        name: 'Vercel',
        url: 'https://vercel.com',
        description: 'Deploy and host web apps',
        icon: '▲',
      },
    ],
  },
]

function loadFromStorage(): Group[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Group[]
      }
    }
  } catch {
    // ignore parse errors
  }
  return SEED_DATA
}

function saveToStorage(groups: Group[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
  } catch {
    // ignore storage errors
  }
}

export function useStore() {
  const [groups, setGroups] = useState<Group[]>(() => loadFromStorage())

  useEffect(() => {
    saveToStorage(groups)
  }, [groups])

  const addGroup = useCallback((name: string) => {
    const newGroup: Group = {
      id: generateId(),
      name,
      links: [],
    }
    setGroups((prev) => [...prev, newGroup])
  }, [])

  const renameGroup = useCallback((groupId: string, name: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, name } : g))
    )
  }, [])

  const deleteGroup = useCallback((groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId))
  }, [])

  const addLink = useCallback((groupId: string, link: Omit<Link, 'id'>) => {
    const newLink: Link = { ...link, id: generateId() }
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, links: [...g.links, newLink] } : g
      )
    )
  }, [])

  const updateLink = useCallback((groupId: string, link: Link) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, links: g.links.map((l) => (l.id === link.id ? link : l)) }
          : g
      )
    )
  }, [])

  const deleteLink = useCallback((groupId: string, linkId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, links: g.links.filter((l) => l.id !== linkId) }
          : g
      )
    )
  }, [])

  const reorderLinks = useCallback((groupId: string, newLinks: Link[]) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, links: newLinks } : g))
    )
  }, [])

  const moveLinkToGroup = useCallback(
    (fromGroupId: string, toGroupId: string, linkId: string, toIndex: number) => {
      setGroups((prev) => {
        const fromGroup = prev.find((g) => g.id === fromGroupId)
        if (!fromGroup) return prev

        const link = fromGroup.links.find((l) => l.id === linkId)
        if (!link) return prev

        return prev.map((g) => {
          if (g.id === fromGroupId) {
            return { ...g, links: g.links.filter((l) => l.id !== linkId) }
          }
          if (g.id === toGroupId) {
            const newLinks = [...g.links]
            const clampedIndex = Math.min(toIndex, newLinks.length)
            newLinks.splice(clampedIndex, 0, link)
            return { ...g, links: newLinks }
          }
          return g
        })
      })
    },
    []
  )

  const reorderGroups = useCallback((newGroups: Group[]) => {
    setGroups(newGroups)
  }, [])

  const importGroups = useCallback((newGroups: Group[]) => {
    setGroups(newGroups)
  }, [])

  const setGroupWidth = useCallback((groupId: string, width: GroupWidth) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, width } : g))
    )
  }, [])

  return {
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
  }
}
