# MyoAtlas

Interactive 3D muscle anatomy viewer with strength rating and nerve innervation mapping.

## Tech Stack

- **Vanilla JS** (ES modules, no framework)
- **Three.js** 0.170 — 3D rendering, raycasting, materials
- **jsPDF** — PDF export
- **Vite** 6 — dev server and bundler
- **Netlify** — deployment target

## Project Structure

```
myoatlas/
  index.html              # Single-page app, right sidebar layout
  package.json            # "myoatlas", deps: three, jspdf, vite
  vite.config.js          # base: '/', manualChunks splits three.js
  netlify.toml            # Build + cache headers for GLBs
  public/
    anatomy.glb           # 467 muscle/tendon meshes (24MB, BodyParts3D + Z-Anatomy)
    skeleton.glb           # Bone meshes (9.4MB)
    mesh_mapping.json      # Mesh metadata (name, FMA ID, source)
    favicon.svg
  src/
    main.js               # App entry: scene, raycasting, UI, controls (~1000 lines)
    bodyBuilder.js         # GLB loading, coordinate transform, material setup
    muscleData.js          # MUSCLE_GROUPS + ANATOMY_DB (~100 muscles, 1200 lines)
    nerveData.js           # NERVE_GROUPS (10 peripheral nerves, pattern matching)
    ratingSystem.js        # 5-level rating with localStorage persistence
    exportService.js       # JSON + PDF export
    styles.css             # Slate-900/teal design system, single sidebar
```

## Key Architecture

- **Material sharing**: One MeshStandardMaterial per muscle group, not cloned per mesh
- **Coordinate transform**: BP3D (mm, Z-up) → Three.js (scene units, Y-up) in bodyBuilder.js
- **Rating keys**: Multi-part muscles share one rating key (e.g. all heads of triceps → "Left Triceps Brachii")
- **Nerve mapping**: Pattern matching in nerveData.js maps mesh rawNames to nerve keys
- **Visible mesh cache**: Raycasting uses cached array, invalidated on visibility changes
- **localStorage**: Ratings persist across sessions under key `myoatlas_ratings`

## Commands

```bash
npm run dev      # Dev server on localhost:4000
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Design System

- Background: `#0f172a` (slate-900)
- Accent: `#0ea5e9` (sky-500)
- Font: Inter (Google Fonts)
- Panels: solid `rgba(15,23,42,0.95)`, no backdrop-filter blur
- Borders: `rgba(148,163,184,0.15)`
- Layout: 48px top bar + 360px right sidebar

## Data Sources

- **BodyParts3D** — CC BY-SA 2.1 Japan (The Database Center for Life Science)
- **Z-Anatomy** — CC BY-SA 4.0 (Gauthier Kervyn)
- **Nerve mapping** — Based on clinical neuromodell document

## Landmines

- GLB files are large (24MB + 9.4MB). Netlify headers set immutable caching for `*.glb`.
- `boneMaterial` has `depthWrite: false` to avoid z-fighting with transparent bones.
- Muscles can belong to multiple nerves (e.g. flexor digitorum profundus → median + ulnar).
- The `mesh_mapping.json` names use spaces but GLTFLoader converts spaces to underscores in node names — bodyBuilder.js normalizes for lookup.
- Rating materials are shared instances. Opacity changes via sliders mutate them in place.
