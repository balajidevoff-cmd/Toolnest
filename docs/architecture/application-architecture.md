# Application Architecture & Component Hierarchy

## Architecture Overview
ToolNest is built as a single-page application (SPA) using **React 19**, **TypeScript** (strict mode), **Vite 6**, and **Tailwind CSS**. The component architecture cleanly decouples global presentation shells, tool metadata catalogs, and individual isolated tool workspaces.

## Component Hierarchy Tree

```
src/
├── main.tsx                      # Mount point & strict mode
├── App.tsx                       # BrowserRouter & lazy route registry
├── index.css                     # Semantic CSS custom properties & utility styles
├── context/
│   └── AppContext.tsx            # Global state: theme, search modal, favorites, recents, toasts
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx         # Main layout container with Header, Footer, and FloatingDock
│   │   ├── Header.tsx            # Fixed top navigation with theme toggle & search shortcut
│   │   ├── Footer.tsx            # High-contrast navigation links & copyright
│   │   └── FloatingDock.tsx      # Adaptive floating dock with tool shortcuts & quick actions
│   ├── common/
│   │   ├── SearchModal.tsx       # Cmd+K search modal with live keyboard navigation
│   │   ├── ToastContainer.tsx    # Stacked alert toast animations
│   │   └── FileUploadDropzone.tsx# Drag & drop upload zone with validation
│   ├── tools/
│   │   ├── ToolCard.tsx          # Responsive tool showcase card with favorite star
│   │   ├── CategoryPills.tsx     # Filter pills for 5 tool domains
│   │   └── ToolWorkspaceLayout.tsx# Shared tool wrapper with breadcrumbs & privacy guarantee
│   └── architecture/
│       ├── DiagramViewer.tsx     # Pan/zoom, fullscreen, SVG export, and code toggle viewer
│       └── diagrams/             # Individual vector SVG diagram implementations
├── data/
│   └── tools.ts                  # Central catalog of all 40 tool metadata entries
└── pages/
    ├── HomePage.tsx              # Hero, featured tools, category grids, and features
    ├── ToolsPage.tsx             # Complete searchable directory of 40 tools
    ├── ToolWorkspacePage.tsx     # Dynamic slug-based tool loader with error boundary
    ├── CategoryPage.tsx          # Category-specific view
    ├── ArchitecturePage.tsx      # Architecture & Diagram Center with 9 interactive diagrams
    ├── FavoritesPage.tsx         # User-bookmarked tools
    ├── RecentPage.tsx            # Recently visited tools history
    ├── AboutPage.tsx             # Project background, architecture, and technology stack
    ├── PrivacyPage.tsx           # Formal privacy policy detailing client-only operations
    └── NotFoundPage.tsx          # 404 recovery page
```

## Tool Metadata Specification
Every tool is declared in `src/data/tools.ts` adhering to the `Tool` interface:

```typescript
export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ToolCategory;
  tags: string[];
  icon: LucideIcon;
  badge?: 'new' | 'popular' | 'updated';
  component: React.ComponentType;
}
```

This strict decoupling ensures that adding a new tool requires only:
1. Creating the tool component under `src/components/tools/<category>/`.
2. Registering its metadata and icon in `src/data/tools.ts`.
All search, filtering, favorite pinning, and workspace layouts automatically reflect the new addition.
