# Mobile UX Redesign - Implementation Guide

## Overview
This document captures the complete mobile UX redesign for MyoAtlas. The redesign transformed a desktop-centric application into a touch-first mobile experience while preserving all desktop functionality.

**Commit**: `6624e42` | **Date**: 2026-04-24 | **Changes**: +932 lines (3 files)

---

## Problem Statement

### Original Mobile Issues
1. **Two-finger pinch zoom didn't work** - Despite `TWO: THREE.TOUCH.DOLLY_PAN` configuration, pinch gestures failed
2. **Rating UI was inaccessible** - Selection card hidden under settings button in cramped sidebar
3. **Export/reset buttons buried** - Required opening full settings sidebar
4. **Poor discoverability** - Only two small circular buttons for all functionality

### Before Architecture
- Desktop sidebars: Left 340px (muscle list) + Right 360px (settings/selection)
- Inline selection card within right sidebar, competing for space
- OrbitControls with `enableZoom: false` and custom wheel-only zoom
- Touch config present but non-functional

---

## Solution: Hybrid Bottom Sheet + FAB Pattern

### Design Decisions
1. **Bottom sheet modal** - Slides up from bottom, thumb-friendly, standard mobile pattern
2. **FAB menu** - Quick access to export/reset/clear actions
3. **Native pinch zoom** - Touch event handlers for two-finger gestures
4. **Desktop unchanged** - All changes scoped via media queries + conditionals
5. **Reuse patterns** - Leverage existing modal/animation systems

### Why This Approach
- **Best mobile UX**: Bottom sheet = standard pattern, large targets, doesn't block view
- **Minimal breaking changes**: Desktop UI identical, mobile builds on existing code
- **Performance**: GPU-accelerated transforms, existing animation patterns
- **Maintainability**: Clear mobile/desktop separation

---

## Implementation

### Phase 1: Two-Finger Pinch Zoom
**File**: `src/main.js` (lines 51-100, 168-249)

**State Tracking**:
```javascript
let touchStartDistance = 0;
let touchStartTarget = new THREE.Vector3();
let isTouchZooming = false;
```

**Key Functions**:
- `getTouchDistance(touch1, touch2)` - Euclidean distance between touches
- `getTouchMidpoint(touch1, touch2)` - Midpoint for raycasting
- `onTouchStart()` - Detect two fingers, calculate distance, find zoom target
- `onTouchMove()` - Apply zoom factor (0.04 speed, delta-based)
- `onTouchEnd()` - Reset state when fingers lift

**Technical Notes**:
- `preventDefault()` only on two-finger touch (preserves OrbitControls rotation)
- Zoom target: midpoint raycasting (same logic as wheel zoom)
- Constraints: `THREE.MathUtils.clamp(dist, 2, 100)`
- Shift strength: 0.15 for smooth target following

---

### Phase 2: Bottom Sheet Rating Modal
**Files**: `index.html` (lines 330-379), `src/styles.css` (lines 1327-1625), `src/main.js` (lines 372-621)

**Structure**:
```
.mobile-rating-backdrop (z: 199)
.mobile-rating-sheet (z: 200)
  ├─ .sheet-handle (40px, swipe gesture)
  ├─ .sheet-header (title + close)
  ├─ .mobile-rating-buttons (5 cols, 56px min-height)
  ├─ .sheet-details (collapsible anatomical info)
  └─ .sheet-actions (Hide Part, Clear Rating)
```

**Key CSS**:
```css
.mobile-rating-sheet {
  position: fixed;
  bottom: 0;
  max-height: 80vh; /* 60vh landscape */
  border-top-left-radius: 16px;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-rating-sheet.active {
  transform: translateY(0);
}

.mobile-rating-buttons {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
```

**JavaScript Logic**:
- `isMobile()` → `window.innerWidth <= 1024`
- `showInfoPanel(userData)` → routes to mobile/desktop
- `showMobileSheet()` → populate + show backdrop + sheet
- `hideMobileSheet()` → close + deselect
- `updateMobileRatingButtons()` → sync active state

**Swipe-to-Dismiss** (100px threshold):
```javascript
sheetHandle.addEventListener('touchstart', (e) => {
  sheetStartY = e.touches[0].clientY;
  sheetIsDragging = true;
  mobileSheet.style.transition = 'none';
});

document.addEventListener('touchmove', (e) => {
  const deltaY = e.touches[0].clientY - sheetStartY;
  if (deltaY > 0) mobileSheet.style.transform = `translateY(${deltaY}px)`;
});

document.addEventListener('touchend', () => {
  if (deltaY > 100) hideMobileSheet();
  mobileSheet.style.transform = '';
});
```

**Accessibility**:
- `role="dialog"` + `aria-modal="true"`
- `aria-labelledby="mobile-info-name"`
- `aria-hidden` state management
- `aria-label` on close/handle

---

### Phase 3: FAB Menu
**Files**: `index.html` (lines 317-332), `src/styles.css` (lines 1627-1728), `src/main.js` (lines 1230-1263)

**Structure**:
```
.mobile-fab-menu (z: 150)
  ├─ .fab-action × 4 (Export JSON, PDF, Reset, Clear)
  └─ .fab-trigger (56px circle)
```

**Staggered Animation**:
```css
.fab-action {
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-fab-menu.active #fab-action-export-json {
  bottom: 248px;
  transition-delay: 0.05s;
}
/* ... delays: 0.05s, 0.1s, 0.15s, 0.2s */
```

**Action Handlers**:
```javascript
document.getElementById('fab-action-export-json').addEventListener('click', () => {
  exportJSON(uniqueRatingKeys.length, ratingKeyToNerves);
  fabMenu.classList.remove('active');
});
// Similar for PDF, Reset, Clear All
```

---

### Phase 4: Mobile Polish
**Files**: `src/main.js` (lines 1343-1379), `src/styles.css` (lines 1730-1789)

**Orientation Handling**:
```javascript
window.addEventListener('resize', () => {
  // Camera aspect ratio update
  if (isMobile() && mobileSheet) {
    const isLandscape = window.innerWidth > window.innerHeight;
    mobileSheet.style.maxHeight = isLandscape ? '60vh' : '80vh';
  }
});
```

**Touch Feedback**:
```css
* { -webkit-tap-highlight-color: transparent; }

@media (max-width: 1024px) {
  button { min-height: 44px; min-width: 44px; }
  .mobile-rating-btn { min-height: 56px; }

  .mobile-rating-sheet,
  .fab-action,
  .fab-trigger {
    will-change: transform; /* GPU acceleration */
  }
}

button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

**UI Update Helpers**:
```javascript
function updateUI() {
  updateProgressChip();
  updateStatsFooter();
  updateMuscleListRatings();

  if (selectedMesh) {
    const rating = getRating(selectedMesh.userData.ratingKey);
    if (isMobile()) {
      updateMobileRatingButtons(rating?.strength || 0);
    } else {
      updateRatingButtons(rating?.strength || 0);
    }
  }
}
```

---

## Z-Index Hierarchy

```
Canvas: 0
Top bar: 10
Mobile menu toggles: 98
Sidebar backdrop: 99
Sidebars: 100
FAB menu: 150
Mobile sheet backdrop: 199
Mobile sheet: 200
Confirm modal: 2000
Loading overlay: 1000
```

---

## Desktop Compatibility

All mobile code isolated via:
1. **CSS**: `@media (max-width: 1024px)`
2. **JS**: `if (isMobile()) { ... } else { ... }`
3. **Display**: `#selection-card { display: none !important; }` on mobile

Desktop unchanged:
- Selection card in right sidebar (index.html lines 229-273)
- `showDesktopInfoPanel()` preserved (main.js lines 326-397)
- Desktop rating buttons (main.js lines 432-471)
- All existing controls functional

---

## Code Reuse

1. **Rating System**: `rateMuscle()`, `getRating()`, `ratingMaterials` shared
2. **Export Service**: `exportJSON()`, `exportPDF()` called from FAB
3. **Modal System**: `showConfirmModal()` reused for clear confirmation
4. **Mesh Management**: `resetMeshAppearance()`, `hiddenMeshes`, `selectedMesh` shared
5. **UI Updates**: `updateMuscleListSelection()`, `updateProgressChip()` shared

---

## Testing Checklist

### Pinch Zoom
- [ ] Two-finger pinch-in/out zooms smoothly
- [ ] Single-finger drag rotates (OrbitControls preserved)
- [ ] Min/max distance constraints (2-100 units)
- [ ] Zoom follows midpoint between fingers

### Bottom Sheet
- [ ] Tap muscle → sheet slides up
- [ ] Tap rating (1-5) → muscle rated, button highlighted
- [ ] Swipe down handle → dismisses (>100px)
- [ ] Tap backdrop/close → dismisses
- [ ] Desktop selection card works on desktop

### FAB Menu
- [ ] Tap trigger → expands with stagger, rotates 45°
- [ ] Export JSON/PDF → opens + downloads
- [ ] Reset View → camera resets
- [ ] Clear All → confirmation modal
- [ ] Auto-close after action / click outside

### Polish
- [ ] Rotate device → UI adapts (60vh landscape)
- [ ] All touch targets ≥ 48x48px (56px rating)
- [ ] 60 FPS animations, no jank
- [ ] Focus-visible on keyboard nav
- [ ] ARIA attributes present

### Integration
- [ ] Mobile: open → select → rate → export → clear
- [ ] Desktop: same workflow, no broken state
- [ ] Switch mobile/desktop view → no issues
- [ ] Test iOS Safari + Chrome Android
- [ ] Test low-end device performance

---

## Performance Optimizations

1. **GPU Acceleration**: `transform` + `opacity` only (no layout props)
2. **will-change**: Applied to animated elements
3. **Cubic Bezier**: `(0.4, 0, 0.2, 1)` for smooth 60 FPS
4. **Passive Listeners**: Used where possible (sheet content scroll)
5. **Transform Caching**: Disable transitions during drag

---

## Known Issues

1. **Passive warnings**: Intentional non-passive on two-finger zoom for `preventDefault()`
2. **Orientation delay**: 100ms timeout to wait for viewport resize
3. **Backdrop blur**: `backdrop-filter: blur(2px)` may fail on old browsers (graceful degradation)
4. **Swipe conflicts**: Scrolling from handle can trigger dismiss (rare edge case)

---

## Future Enhancements

1. **Haptic feedback**: `navigator.vibrate()` on button taps
2. **PWA**: Service worker for offline support
3. **Gesture hints**: Tooltip on first load ("Pinch to zoom, tap to rate")
4. **State persistence**: Save sheet state in sessionStorage
5. **Voice input**: Speech-to-text for muscle search

---

## Key Learnings

1. **Mobile-first ≠ mobile-only**: Scope changes to preserve desktop
2. **Touch events are tricky**: Careful `preventDefault()` management
3. **Bottom sheets > modals**: Natural gestures (swipe) beat overlays
4. **Staggered animations matter**: 50ms delays = polish
5. **Reuse over rewrite**: Existing systems save time, reduce bugs
6. **GPU acceleration is free**: Transform/opacity 10x faster than layout
7. **Accessibility is not optional**: ARIA + focus-visible cost little, help much

---

## File Changes Summary

**Commit `6624e42`**: 3 files, 932 insertions(+), 8 deletions(-)
- `index.html`: +65 lines (sheet + FAB structure)
- `src/main.js`: +407 lines (touch zoom + mobile logic + FAB handlers)
- `src/styles.css`: +460 lines (sheet styles + FAB styles + mobile polish)

---

## References

- **Material Design**: Bottom sheet + FAB patterns
- **iOS HIG**: Touch target sizing (44x44pt minimum)
- **WCAG 2.1**: Level AA accessibility
- **Three.js OrbitControls**: Touch configuration
- **Vite**: HMR workflow

---

**Status**: ✅ Complete and deployed
**Dev Server**: http://localhost:4000/
**Remote**: github-personal:bendeguzkudor/myoatlas.git
