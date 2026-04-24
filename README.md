# MyoAtlas

Interactive 3D muscle anatomy viewer with strength rating and nerve innervation mapping. Built with Three.js.

## Features

- **467 anatomical meshes** from BodyParts3D and Z-Anatomy
- **5-level strength rating** with color-coded visualization (persists to localStorage)
- **10 peripheral nerves** with innervation mapping and spinal segments
- **Dual grouping**: switch between anatomical regions and nerve innervation
- **Anatomical details**: origin, insertion, action, innervation for 100+ muscles
- **Export**: JSON and PDF reports grouped by nerve
- **Keyboard shortcuts**: 1-5 rate, Esc deselect, R reset view
- **Mobile optimized**: Two-finger pinch zoom, bottom sheet UI, FAB quick actions

## Getting Started

```bash
npm install
npm run dev
```

Opens at [http://localhost:4000](http://localhost:4000).

## Build

```bash
npm run build
```

Output in `dist/`. Deploy to Netlify with the included `netlify.toml`.

## Data Attribution

- [BodyParts3D](https://lifesciencedb.jp/bp3d/) — CC BY-SA 2.1 Japan, The Database Center for Life Science
- [Z-Anatomy](https://www.z-anatomy.com/) — CC BY-SA 4.0, Gauthier Kervyn
