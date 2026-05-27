export interface Link {
  id: string;
  name: string;
  url: string;
  description?: string;
  icon?: string; // emoji or undefined (use favicon fallback)
}

export type GroupWidth = 'full' | 'half' | 'third' | 'quarter'

export interface Group {
  id: string;
  name: string;
  links: Link[];
  width?: GroupWidth;
}
