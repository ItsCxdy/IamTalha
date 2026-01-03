# Architecture & Stack Justification

## Tech Stack
*   **Framework: Next.js (App Router)**
    *   *Why:* Industry standard, provides excellent SEO (critical for personal branding), and allows for Server Side Rendering (SSR) of the static content for fast First Contentful Paint (FCP).
*   **Styling: Tailwind CSS**
    *   *Why:* Utility-first approach allows for rapid design iteration without context switching to CSS files. Ensures small bundle size by purging unused styles.
*   **Animation: Framer Motion**
    *   *Why:* Declarative animation library for React. Handles complex enter/exit transitions and layout shifts significantly better than raw CSS keyframes.
*   **Visuals: HTML5 Canvas (Custom implementation)**
    *   *Why:* The user requested "Canvas / lightweight Three.js". To hit Lighthouse 90+, full Three.js bundles can be heavy. A custom Canvas particle system or noise shader offers the "high-end tech" aesthetic with minimal overhead (<5kb JS).

## Design System Principles
*   **Theme:** Minimal Dark (Surface: #0a0a0a, Text: #e5e5e5).
*   **Typography:** 'Inter' for UI/Body (Clean, legible), 'JetBrains Mono' for code/technical elements (Developer credibility).
*   **Interaction:**
    *   Sticky header for persistent navigation.
    *   Subtle hover states (no layout shifts).
    *   Mouse-following radial gradient on background (subtle spotlight effect).

---

# Final Sitemap

1.  **Hero Section**
    *   H1: Name
    *   H2: Role (AI Engineer...)
    *   Positioning Statement
    *   Background: Interactive Particle Field

2.  **About Section**
    *   Condensed professional bio (Systems > Story).
    *   Focus: Reliability, Deployment, Automation.

3.  **Experience Section**
    *   Chronological vertical list.
    *   Focus: Metrics and Scale (e.g., "100+ daily patients", "$50k budgets").

4.  **Projects Section (Grid)**
    *   Cards featuring: Title, Subtitle, Tech Stack Tags, Outcome Description.
    *   Links to GitHub.

5.  **Skills Section**
    *   Categorized Grid (Not a simple list).
    *   Groups: AI/LLM, Backend, Automation, Growth.

6.  **Contact/Footer**
    *   Minimal CTA.
    *   Social Links (LinkedIn, GitHub, Email).
    *   Copyright.
