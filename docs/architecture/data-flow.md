# Data Flow & State Architecture

## State Management Principles
ToolNest adopts a **unidirectional data flow** with zero external network state. State is strictly partitioned into transient in-memory state and persistent device-local state.

## State Partitioning

```
                     ┌────────────────────────────────────────┐
                     │          Browser Application           │
                     └───────────────────┬────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
    ┌─────────────────────────┐                     ┌─────────────────────────┐
    │     Transient State     │                     │     Persistent State    │
    │   (JavaScript Memory)   │                     │  (Browser LocalStorage) │
    ├─────────────────────────┤                     ├─────────────────────────┤
    │ • Current tool input    │                     │ • Theme preference      │
    │ • File ArrayBuffers     │                     │ • Favorite tool IDs     │
    │ • Canvas pixel data     │                     │ • Recent 20 tool IDs    │
    │ • Toast notifications   │                     └─────────────────────────┘
    │ • Search modal open/close│
    └─────────────────────────┘
```

## LocalStorage Schema
All persistent keys are explicitly namespaced with the `toolsnest_` prefix to prevent collisions:

| Key | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `toolsnest_theme` | `'dark' \| 'light'` | System Preference | User's selected theme mode. |
| `toolsnest_favorites` | `string[]` | `[]` | Array of tool IDs pinned by the user. |
| `toolsnest_recent` | `string[]` | `[]` | FIFO array capped at 20 most recently launched tools. |

## Reactive Flow through `AppContext`
```
User Action (e.g. Toggle Theme or Star Tool)
                    │
                    ▼
           Context Action Call
   toggleTheme() / toggleFavorite(toolId)
                    │
                    ▼
            React State Update
         setTheme() / setFavorites()
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
LocalStorage Sync       DOM / Class Sync
saveStoredTheme()       classList.toggle('dark')
                        data-theme attribute
                    │
                    ▼
           Consumer Component
           Re-renders with new token
```
All LocalStorage operations are wrapped in `try/catch` defensive handlers to avoid throwing exceptions in incognito modes or restricted iframe environments.
