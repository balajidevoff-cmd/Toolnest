/**
 * Official Mermaid definitions for ToolNest Architecture Center.
 * These correspond 1-to-1 with the .mmd files in docs/diagrams/
 */

export const SYSTEM_ARCHITECTURE_MMD = `graph TD
    classDef client fill:#ede9fe,stroke:#6d28d9,stroke-width:2px,color:#4c1d95;
    classDef router fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e40af;
    classDef tool fill:#fce7f3,stroke:#db2777,stroke-width:2px,color:#831843;
    classDef browser fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d;
    classDef storage fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f;

    User[👤 User Browser Session]:::client
    Router[🧭 React Router v7 Engine]:::router
    Registry[📋 Central Tool Registry - 40 Tools]:::router
    Workspace[🖥️ Tool Workspace Layout]:::client

    subgraph Utilities [Client-Side Utility Engines]
        PDF[📄 PDF Suite - pdf-lib & pdfjs-dist]:::tool
        Image[🖼️ Image Studio - Canvas & Compressor]:::tool
        QRDev[⚡ QR & Dev - WebCrypto & qrcode]:::tool
        Calc[🧮 Calculators - Math & Precision]:::tool
        Text[✍️ Text & Typography - Safe Markdown]:::tool
        Sec[🛡️ Privacy & Security - Crypto Entropy]:::tool
    end

    subgraph BrowserAPIs [Local Browser Sandbox APIs]
        Canvas[HTML5 Canvas API]:::browser
        WebCrypto[W3C Web Crypto API]:::browser
        Workers[Web Workers / ArrayBuffers]:::browser
        ObjURLs[Temporary Object URLs / Memory]:::browser
    end

    subgraph LocalState [Device Storage Boundary]
        LocalStorage[💾 Browser LocalStorage - Theme, Favorites, History]:::storage
    end

    User -->|Visits Route / Action| Router
    Router -->|Resolves Slug| Registry
    Registry -->|Loads Metadata| Workspace
    Workspace --> Utilities
    Utilities --> BrowserAPIs
    Workspace <-->|Preferences & Recents| LocalStorage
    BrowserAPIs -->|Direct File Export / Download| User
`;

export const APPLICATION_ARCHITECTURE_MMD = `graph TD
    classDef core fill:#ede9fe,stroke:#6d28d9,stroke-width:2px,color:#4c1d95;
    classDef layout fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e40af;
    classDef page fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#0f172a;
    classDef module fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d;

    Entry[src/main.tsx - Entry Point]:::core
    App[src/App.tsx - Router & Lazy Provider]:::core
    Context[src/context/AppContext.tsx - Theme, Favorites, Recents, Toasts]:::core
    Layout[src/components/layout/AppLayout.tsx]:::layout

    subgraph LayoutElements [Global Layout Shell]
        Header[src/components/layout/Header.tsx]:::layout
        FloatingDock[src/components/layout/FloatingDock.tsx]:::layout
        Footer[src/components/layout/Footer.tsx]:::layout
        SearchModal[src/components/common/SearchModal.tsx]:::layout
        ToastContainer[src/components/common/ToastContainer.tsx]:::layout
    end

    subgraph AppPages [Application Route Pages]
        HomePage[src/pages/HomePage.tsx]:::page
        ToolsPage[src/pages/ToolsPage.tsx]:::page
        WorkspacePage[src/pages/ToolWorkspacePage.tsx]:::page
        CategoryPage[src/pages/CategoryPage.tsx]:::page
        ArchitecturePage[src/pages/ArchitecturePage.tsx]:::page
        FavoritesPage[src/pages/FavoritesPage.tsx]:::page
        RecentPage[src/pages/RecentPage.tsx]:::page
        AboutPage[src/pages/AboutPage.tsx]:::page
        PrivacyPage[src/pages/PrivacyPage.tsx]:::page
    end

    subgraph ToolEngine [Registry & Tool Components]
        ToolRegistry[src/data/tools.ts - 40 Metadata Definitions]:::core
        WorkspaceLayout[src/components/tools/ToolWorkspaceLayout.tsx]:::layout
        PdfTools[src/components/tools/pdf/*]:::module
        ImageTools[src/components/tools/image/*]:::module
        QrDevTools[src/components/tools/qr-dev/*]:::module
        CalcTools[src/components/tools/calculators/*]:::module
        TextTools[src/components/tools/text/*]:::module
        SecTools[src/components/tools/security/*]:::module
    end

    Entry --> App
    App --> Context
    App --> Layout
    Layout --> LayoutElements
    Layout --> AppPages
    WorkspacePage --> ToolRegistry
    WorkspacePage --> WorkspaceLayout
    WorkspaceLayout --> PdfTools & ImageTools & QrDevTools & CalcTools & TextTools & SecTools
`;

export const TOOL_EXECUTION_FLOW_MMD = `flowchart TD
    classDef startNode fill:#ede9fe,stroke:#6d28d9,stroke-width:2px,color:#4c1d95;
    classDef stepNode fill:#f1f5f9,stroke:#64748b,stroke-width:1.5px,color:#0f172a;
    classDef decisionNode fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f;
    classDef successNode fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d;
    classDef errorNode fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b;

    Start([1. User Opens Tool Route /tools/:slug]):::startNode
    Resolve[2. Resolve Route & Lookup Tool in tools.ts]:::stepNode
    Mount[3. Mount ToolWorkspaceLayout & Utility Component]:::stepNode
    AddRecent[4. Record Tool ID in LocalStorage Recents]:::stepNode
    Input[5. User Provides Input - Text, Upload, or Slider]:::stepNode
    Validate{6. Validation Check - Size, Type, Syntax}:::decisionNode

    Invalid[Show Inline Error & Alert Toast]:::errorNode
    Process[7. Local In-Memory Processing - Web Worker / Canvas / WASM]:::stepNode
    ProcCheck{8. Processing Success?}:::decisionNode

    ProcFail[Show Meaningful Error Message & Reset State]:::errorNode
    Result[9. Generate Result - ArrayBuffer / DataURL / Blob]:::successNode
    Preview[10. Display Visual Preview or Formatted Output]:::stepNode
    Action[11. User Action - Copy Clipboard or Trigger Download]:::stepNode
    Cleanup[12. Revoke Temporary Object URLs & Free Memory]:::stepNode

    Start --> Resolve --> Mount --> AddRecent --> Input --> Validate
    Validate -- Invalid Input --> Invalid --> Input
    Validate -- Valid Input --> Process --> ProcCheck
    ProcCheck -- Error / Exception --> ProcFail --> Input
    ProcCheck -- Success --> Result --> Preview --> Action --> Cleanup
`;

export const FILE_PROCESSING_FLOW_MMD = `flowchart TD
    classDef client fill:#ede9fe,stroke:#6d28d9,stroke-width:2px,color:#4c1d95;
    classDef validate fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f;
    classDef engine fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d;
    classDef mem fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e40af;
    classDef out fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#581c87;

    Drop[User Selects or Drops File]:::client
    Dropzone[FileUploadDropzone.tsx]:::client

    subgraph Verification [Client Validation Barrier]
        TypeCheck{MIME / Extension Valid?}:::validate
        SizeCheck{Size <= Max MB Limit?}:::validate
    end

    subgraph MemoryProcessing [Local Sandboxed Processing]
        Buffer[Read as ArrayBuffer / FileReader]:::mem
        WorkerEngine[Engine: pdf-lib / Canvas 2D / browser-image-compression]:::engine
        Progress[Compute Output Bytes in RAM]:::engine
    end

    subgraph ExportCycle [Download & Memory Cleanup]
        BlobGen[Create Blob: application/pdf, image/webp]:::mem
        ObjectUrl[URL.createObjectURL(blob)]:::out
        TriggerDownload[Synthesize <a> download element]:::out
        Revoke[URL.revokeObjectURL(url) Cleanup]:::client
    end

    Drop --> Dropzone --> TypeCheck
    TypeCheck -- No --> RejectType[Reject Unsupported Format]:::validate
    TypeCheck -- Yes --> SizeCheck
    SizeCheck -- Exceeds --> RejectSize[Show Maximum MB Limit Error]:::validate
    SizeCheck -- Valid --> Buffer --> WorkerEngine --> Progress --> BlobGen --> ObjectUrl --> TriggerDownload --> Revoke
`;

export const THEME_ARCHITECTURE_MMD = `flowchart TD
    classDef user fill:#ede9fe,stroke:#6d28d9,stroke-width:2px,color:#4c1d95;
    classDef state fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e40af;
    classDef dom fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f;
    classDef css fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d;
    classDef ui fill:#f1f5f9,stroke:#64748b,stroke-width:1.5px,color:#0f172a;

    Init[1. Initial Page Load - inline head script checks LocalStorage]:::state
    Toggle[2. User Clicks Theme Toggle Button]:::user
    AppContext[3. AppContext updates React state]:::state
    Storage[4. saveStoredTheme('dark' | 'light') in LocalStorage]:::state

    subgraph DOMUpdates [DOM Attribute & Scheme Synchronization]
        ClassList[document.documentElement.classList.toggle('dark')]:::dom
        DataTheme[document.documentElement.setAttribute('data-theme', theme)]:::dom
        ColorScheme[document.documentElement.style.colorScheme = theme]:::dom
    end

    subgraph CSSTokens [CSS Variable Layer - src/index.css]
        LightTokens[Light Tokens: --background: #F8FAFC, --foreground: #0F172A, --primary: #6D28D9]:::css
        DarkTokens[Dark Tokens: --background: #090914, --foreground: #F5F3FF, --primary: #A78BFA]:::css
    end

    subgraph RenderedUI [Consistent Visual Hierarchy]
        Cards[Tool Cards & Showcase Units]:::ui
        Inputs[Inputs, Selects, Dropdowns, Dropzones]:::ui
        Diagrams[Interactive Architecture Center SVG Diagrams]:::ui
    end

    Init --> DOMUpdates
    Toggle --> AppContext --> Storage
    AppContext --> DOMUpdates
    DOMUpdates --> CSSTokens
    CSSTokens --> RenderedUI
`;

export const DATA_FLOW_MMD = `flowchart LR
    classDef transient fill:#fee2e2,stroke:#dc2626,stroke-width:1.5px,color:#991b1b;
    classDef persistent fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e40af;
    classDef cloud fill:#f3f4f6,stroke:#9ca3af,stroke-width:1.5px,stroke-dasharray: 5 5,color:#4b5563;

    subgraph RAM [Transient Device RAM - Discarded on Tab Close]
        Files[Uploaded Files & Images]:::transient
        Passwords[Generated Passwords & Hashes]:::transient
        JsonDocs[Formatted JSON Documents]:::transient
        ObjUrls[Temporary Object URLs]:::transient
    end

    subgraph LocalStorage [Persisted Device LocalStorage - Never Leaves Machine]
        ThemePref[Theme Preference - dark / light]:::persistent
        FavList[Bookmarked Favorites Array]:::persistent
        RecentList[Recent 20 Launched Tool IDs]:::persistent
    end

    subgraph CloudZero [External Servers / Third Parties]
        ZeroUpload[NO Server Uploads • NO Telemetry • NO Ads]:::cloud
    end

    RAM -.->|Isolated In Browser Memory| RAM
    LocalStorage -.->|Strictly Client-Side Storage| LocalStorage
`;

export const SECURITY_THREAT_MODEL_MMD = `graph TD
    classDef threat fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b;
    classDef shield fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d;
    classDef note fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#78350f;

    T1[Threat: Malicious File Payload]:::threat
    M1[Mitigation: Strictly Client-Side Parsers, No Server Execution]:::shield

    T2[Threat: Cross-Site Scripting via Markdown]:::threat
    M2[Mitigation: renderSafeMarkdown with HTML entity escaping]:::shield

    T3[Threat: Password & Key Leakage]:::threat
    M3[Mitigation: Passwords never written to LocalStorage or logs]:::shield

    T4[Threat: Memory Leak via Large Files]:::threat
    M4[Mitigation: Size caps & explicit URL.revokeObjectURL calls]:::shield

    T5[Threat: Malformed JSON Crash]:::threat
    M5[Mitigation: Safe try/catch wrappers with clear error toasts]:::shield

    T6[Threat: Weak Password Entropy]:::threat
    M6[Mitigation: crypto.getRandomValues cryptographic randomness]:::shield

    T1 --> M1
    T2 --> M2
    T3 --> M3
    T4 --> M4
    T5 --> M5
    T6 --> M6
`;

export const DEPLOYMENT_ARCHITECTURE_MMD = `graph LR
    classDef dev fill:#ede9fe,stroke:#6d28d9,stroke-width:2px,color:#4c1d95;
    classDef build fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e40af;
    classDef host fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d;
    classDef client fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f;

    Code[Developer Working Tree]:::dev
    Git[Git Repository - main branch]:::dev
    Build[Vite 8.3 & TypeScript tsc -b]:::build
    Bundle[Optimized Dist Assets - HTML, CSS, Split JS Chunks]:::build
    Host[Static Hosting - Vercel / GitHub Pages / Cloudflare]:::host
    CDN[Edge CDN Distribution]:::host
    Browser[User Web Browser]:::client

    Code -->|git commit & push| Git
    Git -->|CI / CD Pipeline| Build
    Build -->|Generates Production Bundle| Bundle
    Bundle -->|Static Deploy| Host
    Host --> CDN
    CDN -->|Loads Static Assets Once| Browser
    Browser -->|All Work Done Locally| Browser
`;

export const USER_JOURNEYS_MMD = `flowchart TD
    subgraph J1 [Journey 1: Search & Launch Tool]
        A1[Press Cmd+K / Click Search] --> B1[Type Tool Name or Tag]
        B1 --> C1[Select Result from Modal]
        C1 --> D1[Navigate to /tools/:slug]
        D1 --> E1[Record ID in toolsnest_recent]
    end

    subgraph J2 [Journey 2: PDF Processing]
        A2[Drop PDF into Upload Zone] --> B2[Validate MIME & Size]
        B2 --> C2[Reorder Pages / Set Range]
        C2 --> D2[pdf-lib Merge in RAM]
        D2 --> E2[URL.createObjectURL -> Download]
    end

    subgraph J3 [Journey 3: Image Crop / Compress]
        A3[Upload PNG/JPG] --> B3[Set Quality & Dimensions]
        B3 --> C3[Canvas In-Memory Render]
        C3 --> D3[Calculate Bytes Saved]
        D3 --> E3[Download Optimized Image]
    end

    subgraph J4 [Journey 4: Theme Switching]
        A4[Click Theme Toggle Sun/Moon] --> B4[Update AppContext theme state]
        B4 --> C4[Sync LocalStorage toolsnest_theme]
        C4 --> D4[Toggle documentElement .dark & data-theme]
        D4 --> E4[All 40 Tools Restyled Instantly]
    end

    subgraph J5 [Journey 5: Favorites & History]
        A5[Click Star Icon on Tool Card] --> B5[Add/Remove ID in toolsnest_favorites]
        B5 --> C5[Show Toast Notification]
        C5 --> D5[Reflect in Floating Dock & /favorites]
    end

    subgraph J6 [Journey 6: Architecture Hub]
        A6[Click Architecture in Nav] --> B6[Open /architecture]
        B6 --> C6[Select Diagram A-J]
        C6 --> D6[Pan / Zoom / Fullscreen / Export SVG]
    end
`;

export const DIAGRAM_SOURCES = {
  'system-overview': SYSTEM_ARCHITECTURE_MMD,
  'app-architecture': APPLICATION_ARCHITECTURE_MMD,
  'tool-execution': TOOL_EXECUTION_FLOW_MMD,
  'file-processing': FILE_PROCESSING_FLOW_MMD,
  'theme-system': THEME_ARCHITECTURE_MMD,
  'data-flow': DATA_FLOW_MMD,
  'security-model': SECURITY_THREAT_MODEL_MMD,
  'deployment-architecture': DEPLOYMENT_ARCHITECTURE_MMD,
  'user-journeys': USER_JOURNEYS_MMD,
} as const;

