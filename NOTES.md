# Web Developer Practical Test Notes — ZoomInfo Profile Rebuild

This file documents the development process, architectural decisions, and an honest breakdown of the time spent on each phase of the project.

---

## ⏱️ Time Honesty Log

| Phase | Description | Time Spent |
| :--- | :--- | :---: |
| **Research & Planning** | Analyzed ZoomInfo layout structures (header, grids, metrics, sidebars) and planned the Elementor-ready implementation. | **15 minutes** |
| **HTML Structure** | Built the semantic HTML5 structure with logical grid boundaries, metrics displays, searchable/filterable panels, tables, timelines, accordions, and overlays. | **25 minutes** |
| **CSS Styling & Polish** | Programmed CSS Custom Properties (variables) for theme management, responsive grid columns, responsive flex directions, hover micro-animations, and page loaders. | **40 minutes** |
| **JS Interactivity** | Programmed theme state persistence, scrollspy nav highlighting, contact directories filtering/revealing with simulated network delay, tech filtering, accordion collapsers, and modal rendering. | **25 minutes** |
| **Vite & Compatibility Build** | Initialized Vite environment, verified production builds, and compiled the unified single-file `elementor-ready.html` pasteable widget code. | **10 minutes** |
| **Mobile Drawer & Modals Expansion** | Implemented the responsive mobile Hamburger navigation drawer, search overlay, interactive Upgrade Plan tiers pricing table, and My Profile settings dashboard modal. | **15 minutes** |
| **Total Time** | | **130 minutes** |

---

## 🏗️ Architectural & Design Choices

1. **Vite Development Server**:
   - Initialized a modern Vanilla JS project with Vite to enable Hot Module Replacement (HMR) during development.
   - Run `npm install` and `npm run dev` to boot up the local dev server.
   
2. **Light / Dark Mode (HSL Custom Properties)**:
   - Configured full UI color coordinates using CSS Variables. Toggling the `.dark` class on the `<body>` swaps values smoothly.
   - The theme choice is saved to the browser's `localStorage` and automatically loaded on subsequent visits.
   
3. **Elementor Compatibility Strategy**:
   - Because Elementor operates as a plugin inside WordPress and lacks direct support for importing complex multi-file structures easily, we generated two deliverables:
     - **Modular Version**: Separated `index.html`, `/src/style.css`, and `/src/main.js` (inside Vite).
     - **Unified Widget Version (`elementor-ready.html`)**: A single file containing HTML, inline `<style>`, and inline `<script>`.
   - **How to install in Elementor**:
     1. Open your page inside the Elementor editor.
     2. Drag the **HTML Widget** into your page layout.
     3. Open `elementor-ready.html`, copy the entire text, and paste it into the HTML code field of the widget.
     4. The widget will render instantly with the complete layout, responsive breakpoints, sticky sub-navigation, and working interactivity!

4. **Mobile Navigation Drawer**:
   - On screens under **768px**, header actions (Upgrade Plan button, profile avatar) collapse into a header Hamburger button.
   - Clicking the Hamburger button slides out a responsive navigation drawer containing a mobile search bar, membership upgrade shortcut, and profile settings options.

5. **Upgrade Plan Pricing Modal**:
   - Clicking "Upgrade Plan" (either in the desktop header or mobile drawer) displays a 3-column pricing card grid (Starter, Professional, Enterprise) detailing features, price plans, and custom gradients. Responsive layouts collapse these to 2-columns (tablet) and 1-column (mobile).

6. **My Profile Settings Modal**:
   - Clicking the "AY" avatar displays the user settings modal dashboard. Shows user details (Amit Yadav, SDR), an interactive credits usage progression bar (412 / 500 unlocks used), active CRM integration sync status, and system details.

7. **Interactive Features**:
   - **Scrollspy Navigation**: Sub-navbar elements stick to the top when scrolling down, and highlight active categories by observing scroll coordinates.
   - **Overview Text Collapser**: Seamless max-height expansion of the paragraph text.
   - **Interactive Contact Table**: Filters rows dynamically based on the department tab selection and search query. Clicking "Get Email" or "Get Phone" animates a loading spinner before displaying verified contact details (simulating database requests).
   - **Technographic Match Highlight**: Real-time keyword filter overlays standard tech cards and badges.
   - **Funding Row Toggle**: Clicking rows expands detail tables inline.
   - **FAQ Accordions**: Accordion items toggle correctly, collapsing other open tabs.
   - **Competitor Comparison Modal**: Modal popup dynamically pulls attributes (Revenue, HQ, Tech Stack) from similar company lists and injects them side-by-side.

---

## 🖥️ Local Startup Commands

Ensure you have Node.js installed, then execute:

```bash
# Install development dependencies
npm install

# Start the Vite local server
npm run dev

# Run production validation compiler
npm run build
```
