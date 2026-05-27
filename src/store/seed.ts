import { Group } from '../types'

export const SEED_DATA: Group[] = [
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
