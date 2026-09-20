# UI & Design System

Talkie's user interface is built on a dark-first **Glassmorphism Design System** crafted with Tailwind CSS, custom design tokens, and smooth micro-animations.

---

## 1. Design System Architecture

```mermaid
flowchart TD
    subgraph Tokens["Design Tokens (packages/ui/tokens)"]
        Colors["Color Palette\n(Obsidian, Slate, Emerald)"]
        Typography["Typography System\n(Geist Sans, Geist Mono)"]
        Glassmorphism["Glass Utilities\n(Backdrop Blur, Border Highlights)"]
    end

    subgraph Primitives["UI Primitives (packages/ui/components)"]
        Button["Button & Action Buttons"]
        Badge["Badge & Status Indicators"]
        Card["Glass Cards & Panels"]
        Input["Input & Form Selects"]
        Dialog["Modal & Drawer Panels"]
        Stats["Telemetry & Metric Cards"]
    end

    subgraph Views["Dashboard & Application Views (apps/web)"]
        LandingView["Marketing & Interactive Mascots"]
        DashboardShell["Dashboard Shell & Responsive Sidebar"]
        AgentEditor["Agent Configuration Suite"]
        LiveCallRoom["Live Audio Stream & Transcript Visualizer"]
    end

    Tokens --> Primitives
    Primitives --> Views
```

---

## 2. Color Palette & Theming Tokens

Talkie utilizes an obsidian dark palette punctuated by vibrant status accents:

```mermaid
classDiagram
    class NeutralTheme {
        Background: #08090b
        CardSurface: #0a0c10
        BorderSubtle: rgba(255, 255, 255, 0.08)
        BorderHover: rgba(16, 185, 129, 0.3)
    }

    class AccentColors {
        PrimaryEmerald: #10b981
        EmeraldGlow: rgba(16, 185, 129, 0.15)
        CyanActive: #06b6d4
        AmberWarning: #f59e0b
        RoseError: #f43f5e
    }
```

---

## 3. Responsive Layout Strategy

- **Desktop (md & lg screens):** Persistent multi-level collapsible sidebar with contextual quick actions, full analytics dashboards, and multi-pane call inspectors.
- **Mobile (< md screens):** Gesture-friendly sliding drawers, collapsible telemetry cards, stacked list views, and touch-optimized action bars.
- **Accessibility & Focus:** Full keyboard navigation support (`Tab`, `Escape`, `Enter`), ARIA landmarks on interactive controls, and high-contrast text ratios.
