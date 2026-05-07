import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildBody, highlightMaterial, selectedMaterial, boneMaterial, groupMaterials, deriveRatingKey } from './bodyBuilder.js';
import { MUSCLE_GROUPS } from './muscleData.js';
import { NERVE_GROUPS, buildNerveMeshMap } from './nerveData.js';
import { STRENGTH_LEVELS, setRating, getRating, getAllRatings, clearAllRatings, getRatingStats, getRatingMaterial, loadFromStorage } from './ratingSystem.js';
import { exportJSON, exportPDF } from './exportService.js';
import { isPriorityMuscle, getPriorityInfo } from './priorityMuscles.js';
import { EXAM_MUSCLE_GROUPS } from './examMuscleList.js';
import {
  createReflexHotspots,
  createPyramidalHotspots,
  animateHotspots,
  updateHotspotAppearance,
  getReflexDefinitionsForHotspot,
  getPyramidalSignsForHotspot
} from './reflexHotspots.js';
import { loadReflexesFromStorage, setReflexTest, getReflexTest, setPyramidalSign, getPyramidalSign, clearAllReflexData } from './reflexSystem.js';
import { REFLEX_GRADES } from './reflexData.js';

// ───────────── Scene Setup ─────────────

const canvas = document.getElementById('canvas3d');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
camera.position.set(0, 5, 35);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2;
controls.maxDistance = 100;
controls.target.set(0, 5, 0);
controls.enableZoom = false; // Disabled for custom zoom
controls.update();

// Enable touch controls for mobile
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN
};

// ───────────── Cursor-directed Zoom ─────────────

const zoomRaycaster = new THREE.Raycaster();
const zoomMouse = new THREE.Vector2();

// Touch zoom state
let touchStartDistance = 0;
let touchStartTarget = new THREE.Vector3();
let isTouchZooming = false;

canvas.addEventListener('wheel', (event) => {
  event.preventDefault();

  const delta = -Math.sign(event.deltaY);
  const zoomSpeed = 0.04;

  const offset = camera.position.clone().sub(controls.target);
  const dist = offset.length();

  if (delta > 0 && dist <= controls.minDistance) return;
  if (delta < 0 && dist >= controls.maxDistance) return;

  zoomMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  zoomMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  zoomRaycaster.setFromCamera(zoomMouse, camera);

  let hitPoint = null;
  const allTargets = [...muscleMeshes];
  if (skeletonGroup) {
    skeletonGroup.traverse((child) => {
      if (child.isMesh && child.visible) allTargets.push(child);
    });
  }
  const intersects = zoomRaycaster.intersectObjects(allTargets, false);
  if (intersects.length > 0) {
    hitPoint = intersects[0].point.clone();
  }

  const factor = 1 - delta * zoomSpeed;
  const newDist = THREE.MathUtils.clamp(dist * factor, controls.minDistance, controls.maxDistance);

  if (hitPoint && delta > 0) {
    const shiftStrength = 0.15;
    controls.target.lerp(hitPoint, shiftStrength);
  }

  offset.normalize().multiplyScalar(newDist);
  camera.position.copy(controls.target).add(offset);
  controls.update();
}, { passive: false });

// ───────────── Touch Pinch Zoom ─────────────

function getTouchDistance(touch1, touch2) {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getTouchMidpoint(touch1, touch2) {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2
  };
}

function onTouchStart(event) {
  if (event.touches.length === 2) {
    event.preventDefault();
    isTouchZooming = true;

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    touchStartDistance = getTouchDistance(touch1, touch2);

    // Find zoom target at midpoint between fingers
    const midpoint = getTouchMidpoint(touch1, touch2);
    zoomMouse.x = (midpoint.x / window.innerWidth) * 2 - 1;
    zoomMouse.y = -(midpoint.y / window.innerHeight) * 2 + 1;
    zoomRaycaster.setFromCamera(zoomMouse, camera);

    const allTargets = [...muscleMeshes];
    if (skeletonGroup) {
      skeletonGroup.traverse((child) => {
        if (child.isMesh && child.visible) allTargets.push(child);
      });
    }
    const intersects = zoomRaycaster.intersectObjects(allTargets, false);
    if (intersects.length > 0) {
      touchStartTarget.copy(intersects[0].point);
    } else {
      touchStartTarget.copy(controls.target);
    }
  }
}

function onTouchMove(event) {
  if (event.touches.length === 2 && isTouchZooming) {
    event.preventDefault();

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const currentDistance = getTouchDistance(touch1, touch2);

    if (touchStartDistance === 0) return;

    // Calculate zoom factor (inverted: pinch in = zoom in)
    const delta = currentDistance > touchStartDistance ? 1 : -1;
    const zoomSpeed = 0.04;

    const offset = camera.position.clone().sub(controls.target);
    const dist = offset.length();

    if (delta > 0 && dist <= controls.minDistance) return;
    if (delta < 0 && dist >= controls.maxDistance) return;

    const factor = 1 - delta * zoomSpeed;
    const newDist = THREE.MathUtils.clamp(dist * factor, controls.minDistance, controls.maxDistance);

    // Shift target toward touch point when zooming in
    if (delta > 0) {
      const shiftStrength = 0.15;
      controls.target.lerp(touchStartTarget, shiftStrength);
    }

    offset.normalize().multiplyScalar(newDist);
    camera.position.copy(controls.target).add(offset);
    controls.update();

    // Update for next frame
    touchStartDistance = currentDistance;
  }
}

function onTouchEnd(event) {
  if (event.touches.length < 2) {
    isTouchZooming = false;
    touchStartDistance = 0;
  }
}

canvas.addEventListener('touchstart', onTouchStart, { passive: false });
canvas.addEventListener('touchmove', onTouchMove, { passive: false });
canvas.addEventListener('touchend', onTouchEnd, { passive: false });

// ───────────── Lighting ─────────────

const ambientLight = new THREE.AmbientLight(0x8088a0, 1.4);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffeedd, 1.8);
keyLight.position.set(10, 20, 15);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 60;
keyLight.shadow.camera.left = -20;
keyLight.shadow.camera.right = 20;
keyLight.shadow.camera.top = 30;
keyLight.shadow.camera.bottom = -20;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x9999dd, 1.0);
fillLight.position.set(-10, 10, -10);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0x6688aa, 0.5);
rimLight.position.set(0, 5, -20);
scene.add(rimLight);

const bottomLight = new THREE.DirectionalLight(0x778899, 0.6);
bottomLight.position.set(0, -10, 5);
scene.add(bottomLight);

const hemiLight = new THREE.HemisphereLight(0xbbddff, 0x553333, 0.8);
scene.add(hemiLight);

const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
frontLight.position.set(0, 10, 20);
scene.add(frontLight);

// ───────────── Ground Grid ─────────────

const gridHelper = new THREE.GridHelper(60, 30, 0x1e293b, 0x0f172a);
gridHelper.position.y = -16;
scene.add(gridHelper);

const groundGeo = new THREE.PlaneGeometry(60, 60);
const groundMat = new THREE.ShadowMaterial({ opacity: 0.3 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -16;
ground.receiveShadow = true;
scene.add(ground);

// ───────────── Loading Overlay ─────────────

const loadingOverlay = document.getElementById('loading-overlay');
const loadingBar = document.getElementById('loading-bar');
const loadingText = document.getElementById('loading-text');

function updateLoadingProgress(pct) {
  if (loadingBar) loadingBar.style.width = `${pct}%`;
  if (loadingText) loadingText.textContent = `Loading anatomy model... ${pct}%`;
}

function hideLoadingOverlay() {
  if (loadingOverlay) {
    loadingOverlay.style.opacity = '0';
    setTimeout(() => { loadingOverlay.style.display = 'none'; }, 500);
  }
}

// ───────────── Shared State ─────────────

let muscleMeshes = [];
let skeletonGroup = null;
let bodyGroup = null;

let defaultCameraPos = new THREE.Vector3(0, 5, 35);
let defaultLookAt = new THREE.Vector3(0, 5, 0);

const hiddenMeshes = new Set();

// Rating-specific state
let ratingKeyToMeshes = new Map();  // ratingKey → Mesh[]
let nerveMeshMap = new Map();        // rawName(lower) → [nerveKey, ...]
let ratingKeyToNerves = new Map();   // ratingKey(lower) → [nerveKey, ...]
let uniqueRatingKeys = [];           // Sorted unique rating keys

// Grouping mode: 'anatomy' or 'nerve'
let groupingMode = 'anatomy';

// Priority filter: 'all' or 'priority'
let priorityFilter = localStorage.getItem('myoatlas_priority_filter') || 'priority';
if (!['all', 'priority'].includes(priorityFilter)) priorityFilter = 'priority';

// App mode: 'exploration' or 'examination' (chosen at startup)
let APP_MODE = null;

// Group heads setting: whether to group muscle heads/parts for rating
const groupHeads = true;

// Examination view: 'muscle', 'reflex', or 'pyramidal'
let examView = localStorage.getItem('myoatlas_exam_view')
  || (localStorage.getItem('myoatlas_reflex_mode_active') === 'true' ? 'reflex' : 'muscle');
if (!['muscle', 'reflex', 'pyramidal'].includes(examView)) examView = 'muscle';
let hideMusclesInReflexMode = localStorage.getItem('myoatlas_exam_muscles_visible') !== 'true';
let reflexHotspotsGroup = null;
let reflexHotspots = []; // Array for raycasting
let pyramidalHotspotsGroup = null;
let pyramidalHotspots = [];
let selectedReflexHotspot = null;

// ───────────── Raycasting & Interaction ─────────────

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredMesh = null;
let selectedMesh = null;
let canvasPointerDown = false;
let canvasPointerMoved = false;
let canvasPointerStartX = 0;
let canvasPointerStartY = 0;
let suppressNextCanvasClick = false;
const POINTER_DRAG_THRESHOLD = 6;

// ───────────── Visible Mesh Cache ─────────────

let visibleMeshesCache = [];
let visibleMeshesDirty = true;

function getVisibleMeshes() {
  if (visibleMeshesDirty) {
    visibleMeshesCache = muscleMeshes.filter(m => m.visible);
    visibleMeshesDirty = false;
  }
  return visibleMeshesCache;
}

function invalidateVisibleMeshes() {
  visibleMeshesDirty = true;
}

canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('click', onClick);
canvas.addEventListener('pointerdown', onCanvasPointerDown);
canvas.addEventListener('pointermove', onCanvasPointerMove);
canvas.addEventListener('pointerup', onCanvasPointerUp);
canvas.addEventListener('pointercancel', onCanvasPointerCancel);

function getActiveExamHotspots() {
  if (examView === 'reflex') return reflexHotspots;
  if (examView === 'pyramidal') return pyramidalHotspots;
  return [];
}

function onMouseMove(event) {
  if (muscleMeshes.length === 0) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const activeHotspots = getActiveExamHotspots();
  const targets = isHotspotExamView() ? activeHotspots : getVisibleMeshes();

  const intersects = raycaster.intersectObjects(targets, false);

  if (hoveredMesh && hoveredMesh !== selectedMesh) {
    resetMeshAppearance(hoveredMesh);
  }

  if (intersects.length > 0) {
    const mesh = intersects[0].object;
    if (mesh !== selectedMesh) {
      hoveredMesh = mesh;

      // For exam hotspots, brighten the existing color instead of replacing it
      if (mesh.userData.type === 'reflexHotspot' || mesh.userData.type === 'pyramidalHotspot') {
        // Store original material if not already stored
        if (!mesh.userData.originalMaterial) {
          mesh.userData.originalMaterial = mesh.material;
        }
        // Create a brighter version by increasing emissiveIntensity
        const hoverMaterial = mesh.material.clone();
        hoverMaterial.emissiveIntensity = 2.5; // Brighter on hover
        mesh.material = hoverMaterial;
      } else {
        // Regular muscle hover
        mesh.material = highlightMaterial;
      }
    }
    canvas.style.cursor = 'pointer';
  } else {
    hoveredMesh = null;
    canvas.style.cursor = 'default';
  }
}

function onClick(event) {
  if (muscleMeshes.length === 0) return;
  if (suppressNextCanvasClick) {
    suppressNextCanvasClick = false;
    return;
  }

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const activeHotspots = getActiveExamHotspots();
  const targets = isHotspotExamView() ? activeHotspots : getVisibleMeshes();

  const intersects = raycaster.intersectObjects(targets, false);

  if (intersects.length > 0) {
    const obj = intersects[0].object;

    // Check if it's an exam hotspot or muscle mesh
    if (obj.userData.type === 'reflexHotspot' || obj.userData.type === 'pyramidalHotspot') {
      if (selectedReflexHotspot && selectedReflexHotspot !== obj) {
        selectedReflexHotspot.userData.isSelected = false;
        updateHotspotAppearance(selectedReflexHotspot);
      }
      selectedReflexHotspot = obj;
      selectedReflexHotspot.userData.isSelected = true;
      updateHotspotAppearance(selectedReflexHotspot);
      showExamHotspotPanel(obj.userData);
    } else {
      if (selectedMesh === obj && selectedExamEntryIndex === -1) {
        clearCurrentSelection();
        return;
      }
      if (selectedMesh && selectedMesh !== obj) {
        resetMeshAppearance(selectedMesh);
      }
      // Muscle mesh clicked (existing flow)
      selectedMesh = obj;
      selectedExamEntryIndex = -1;
      obj.material = selectedMaterial;
      showInfoPanel(obj.userData);
      zoomToMesh(obj);
    }
  }
}

function onCanvasPointerDown(event) {
  if (event.button !== 0) return;
  canvasPointerDown = true;
  canvasPointerMoved = false;
  canvasPointerStartX = event.clientX;
  canvasPointerStartY = event.clientY;
}

function onCanvasPointerMove(event) {
  if (!canvasPointerDown) return;
  const dx = event.clientX - canvasPointerStartX;
  const dy = event.clientY - canvasPointerStartY;
  if (Math.hypot(dx, dy) >= POINTER_DRAG_THRESHOLD) {
    canvasPointerMoved = true;
  }
}

function onCanvasPointerUp() {
  if (!canvasPointerDown) return;
  suppressNextCanvasClick = canvasPointerMoved;
  canvasPointerDown = false;
  canvasPointerMoved = false;
}

function onCanvasPointerCancel() {
  canvasPointerDown = false;
  canvasPointerMoved = false;
  suppressNextCanvasClick = false;
}

function resetMeshAppearance(mesh) {
  // For exam hotspots, restore original material
  if ((mesh.userData.type === 'reflexHotspot' || mesh.userData.type === 'pyramidalHotspot') && mesh.userData.originalMaterial) {
    mesh.material = mesh.userData.originalMaterial;
    return;
  }

  // For muscles: Priority: rated > original
  const ratingKey = mesh.userData.ratingKey;
  const rating = ratingKey ? getRating(ratingKey) : null;
  if (rating) {
    mesh.material = getRatingMaterial(rating.strength);
  } else if (mesh.userData.originalMaterial) {
    mesh.material = mesh.userData.originalMaterial;
  }
}

// ───────────── Rating System Integration ─────────────

function rateMuscle(mesh, strength) {
  const examEntry = orderedExamEntries[selectedExamEntryIndex] || null;
  const ratingKeys = examEntry ? getExamEntryRatingKeys(examEntry) : [mesh.userData.ratingKey].filter(Boolean);
  if (ratingKeys.length === 0) return;

  const mat = getRatingMaterial(strength);

  for (const ratingKey of ratingKeys) {
    setRating(ratingKey, strength);

    const meshes = ratingKeyToMeshes.get(ratingKey) || [];
    for (const m of meshes) {
      m.material = mat;
    }
  }

  updateUI();
  scrollSelectedExamEntryIntoView();
  applyExamSelectionFocus();

  if (autoProceed && APP_MODE === 'examination') {
    setTimeout(() => selectNextExamEntry(), 150);
  } else if (selectedMesh) {
    selectedMesh = null;
    hideInfoPanel();
  }

  updateMuscleListRatings();
  updateWorkflowButtons();
}

function clearCurrentSelection() {
  if (selectedMesh) {
    resetMeshAppearance(selectedMesh);
    selectedMesh = null;
  }
  selectedExamEntryIndex = -1;
  hideInfoPanel();
  updateMuscleListSelection();
  updateWorkflowButtons();
  applyExamSelectionFocus();
}

// ───────────── Info Panel ─────────────

// Mobile detection helper
const isMobile = () => window.innerWidth <= 1024;

const selectionCard = document.getElementById('selection-card');
const infoName = document.getElementById('info-name');
const infoType = document.getElementById('info-type');
const infoNerveBadge = document.getElementById('info-nerve-badge');
const infoDetails = document.getElementById('info-details');
const infoClose = document.getElementById('info-close');
const currentRatingLabel = document.getElementById('current-rating-label');

infoClose.addEventListener('click', () => {
  hideInfoPanel();
  if (selectedMesh) {
    resetMeshAppearance(selectedMesh);
    selectedMesh = null;
  }
  selectedExamEntryIndex = -1;
  updateWorkflowButtons();
});

function showInfoPanel(userData) {
  if (isMobile()) {
    showMobileSheet(userData);
  } else {
    showDesktopInfoPanel(userData);
  }
  applyExamSelectionFocus();
}

function showDesktopInfoPanel(userData) {
  const data = userData.muscleData;
  const info = data.info;

  infoName.textContent = userData.displayName;
  infoType.textContent = data.type;
  infoType.className = `badge ${data.type}`;

  // Nerve badge
  const rawName = (data.rawName || '').toLowerCase();
  const nerves = nerveMeshMap.get(rawName) || [];
  if (nerves.length > 0) {
    const nerveLabels = nerves.map(nk => NERVE_GROUPS[nk]?.label || nk).join(', ');
    infoNerveBadge.textContent = nerveLabels;
    infoNerveBadge.classList.remove('hidden');
  } else {
    infoNerveBadge.classList.add('hidden');
  }

  // Anatomical details
  let html = '';
  if (data.type === 'muscle') {
    html += `<p><strong>Group:</strong> ${MUSCLE_GROUPS[data.group]?.label || data.group}</p>`;
    html += `<p><strong>Origin:</strong> ${info.origin}</p>`;
    html += `<p><strong>Insertion:</strong> ${info.insertion}</p>`;
    html += `<p><strong>Action:</strong> ${info.action}</p>`;
    if (info.innervation) {
      html += `<p><strong>Innervation:</strong> ${info.innervation}</p>`;
    }
  } else {
    html += `<p><strong>Group:</strong> ${MUSCLE_GROUPS[data.group]?.label || data.group}</p>`;
    html += `<p><strong>From:</strong> ${info.origin}</p>`;
    html += `<p><strong>To:</strong> ${info.insertion}</p>`;
    html += `<p><strong>Function:</strong> ${info.action}</p>`;
    if (info.notes) {
      html += `<p><strong>Notes:</strong> ${info.notes}</p>`;
    }
  }
  infoDetails.innerHTML = html;

  // External links
  const infoLinks = document.getElementById('info-links');
  infoLinks.innerHTML = '';
  const searchTerm = getAnatomySearchTerm(data.rawName);
  const wikiSearchUrl = `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(searchTerm + ' muscle anatomy')}`;
  const kenHubUrl = `https://www.kenhub.com/en/search?q=${encodeURIComponent(searchTerm)}`;

  const wikiLink = document.createElement('a');
  wikiLink.href = wikiSearchUrl;
  wikiLink.target = '_blank';
  wikiLink.rel = 'noopener noreferrer';
  wikiLink.textContent = 'Wikipedia';
  infoLinks.appendChild(wikiLink);

  const kenHubLink = document.createElement('a');
  kenHubLink.href = kenHubUrl;
  kenHubLink.target = '_blank';
  kenHubLink.rel = 'noopener noreferrer';
  kenHubLink.textContent = 'Kenhub';
  infoLinks.appendChild(kenHubLink);

  // Update rating button states
  const ratingKey = userData.ratingKey;
  const rating = ratingKey ? getRating(ratingKey) : null;
  updateRatingButtons(rating?.strength || 0);

  // Show/hide clear rating button based on whether there's a rating
  const clearRatingBtn = document.getElementById('btn-clear-rating');
  if (clearRatingBtn) {
    clearRatingBtn.style.display = rating ? 'block' : 'none';
  }

  selectionCard.classList.remove('hidden');

  // Highlight in muscle list
  updateMuscleListSelection();
}

// ───────────── Mobile Bottom Sheet ─────────────

const mobileSheet = document.getElementById('mobile-rating-sheet');
const mobileBackdrop = document.getElementById('mobile-rating-backdrop');
const mobileInfoName = document.getElementById('mobile-info-name');
const mobileInfoType = document.getElementById('mobile-info-type');
const mobileInfoNerveBadge = document.getElementById('mobile-info-nerve-badge');
const mobileInfoDetails = document.getElementById('mobile-info-details');
const mobileInfoLinks = document.getElementById('mobile-info-links');
const mobileCurrentRatingLabel = document.getElementById('mobile-current-rating-label');
const mobileSheetClose = document.getElementById('mobile-sheet-close');

function showMobileSheet(userData) {
  const data = userData.muscleData;
  const info = data.info;

  mobileInfoName.textContent = userData.displayName;
  mobileInfoType.textContent = data.type;
  mobileInfoType.className = `badge ${data.type}`;

  // Nerve badge
  const rawName = (data.rawName || '').toLowerCase();
  const nerves = nerveMeshMap.get(rawName) || [];
  if (nerves.length > 0) {
    const nerveLabels = nerves.map(nk => NERVE_GROUPS[nk]?.label || nk).join(', ');
    mobileInfoNerveBadge.textContent = nerveLabels;
    mobileInfoNerveBadge.classList.remove('hidden');
  } else {
    mobileInfoNerveBadge.classList.add('hidden');
  }

  // Anatomical details
  let html = '';
  if (data.type === 'muscle') {
    html += `<p><strong>Group:</strong> ${MUSCLE_GROUPS[data.group]?.label || data.group}</p>`;
    html += `<p><strong>Origin:</strong> ${info.origin}</p>`;
    html += `<p><strong>Insertion:</strong> ${info.insertion}</p>`;
    html += `<p><strong>Action:</strong> ${info.action}</p>`;
    if (info.innervation) {
      html += `<p><strong>Innervation:</strong> ${info.innervation}</p>`;
    }
  } else {
    html += `<p><strong>Group:</strong> ${MUSCLE_GROUPS[data.group]?.label || data.group}</p>`;
    html += `<p><strong>From:</strong> ${info.origin}</p>`;
    html += `<p><strong>To:</strong> ${info.insertion}</p>`;
    html += `<p><strong>Function:</strong> ${info.action}</p>`;
    if (info.notes) {
      html += `<p><strong>Notes:</strong> ${info.notes}</p>`;
    }
  }
  mobileInfoDetails.innerHTML = html;

  // External links
  mobileInfoLinks.innerHTML = '';
  const searchTerm = getAnatomySearchTerm(data.rawName);
  const wikiSearchUrl = `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(searchTerm + ' muscle anatomy')}`;
  const kenHubUrl = `https://www.kenhub.com/en/search?q=${encodeURIComponent(searchTerm)}`;

  const wikiLink = document.createElement('a');
  wikiLink.href = wikiSearchUrl;
  wikiLink.target = '_blank';
  wikiLink.rel = 'noopener noreferrer';
  wikiLink.textContent = 'Wikipedia';
  mobileInfoLinks.appendChild(wikiLink);

  const kenHubLink = document.createElement('a');
  kenHubLink.href = kenHubUrl;
  kenHubLink.target = '_blank';
  kenHubLink.rel = 'noopener noreferrer';
  kenHubLink.textContent = 'Kenhub';
  mobileInfoLinks.appendChild(kenHubLink);

  // Update rating button states
  const ratingKey = userData.ratingKey;
  const rating = ratingKey ? getRating(ratingKey) : null;
  updateMobileRatingButtons(rating?.strength || 0);

  // Show/hide clear rating button
  const mobileClearRatingBtn = document.getElementById('mobile-btn-clear-rating');
  if (mobileClearRatingBtn) {
    mobileClearRatingBtn.style.display = rating ? 'block' : 'none';
  }

  // Show sheet and backdrop
  mobileBackdrop.classList.add('active');
  mobileBackdrop.setAttribute('aria-hidden', 'false');
  mobileSheet.classList.add('active');
  mobileSheet.setAttribute('aria-hidden', 'false');

  // Highlight in muscle list
  updateMuscleListSelection();
}

// ───────────── Exam Hotspot Panel Functions ─────────────

function showExamHotspotPanel(hotspotData) {
  if (isMobile()) {
    showMobileExamSheet(hotspotData);
  } else {
    showDesktopExamPanel(hotspotData);
  }
}

function getSideLabel(side) {
  return side.charAt(0).toUpperCase() + side.slice(1);
}

function renderReflexRows(container, hotspotData, compact = false) {
  container.innerHTML = '';
  const reflexes = getReflexDefinitionsForHotspot(hotspotData);

  reflexes.forEach(reflexDef => {
    const currentTest = getReflexTest(reflexDef.id, hotspotData.side);
    const row = document.createElement('div');
    row.className = compact ? 'exam-test-row compact' : 'exam-test-row';

    const details = document.createElement('div');
    details.className = 'exam-test-details';
    details.innerHTML = `
      <div class="exam-test-name">${reflexDef.label}</div>
      <div class="exam-test-meta">${reflexDef.nerve} - ${reflexDef.spinalLevel}</div>
      <div class="exam-test-notes">${reflexDef.testingNotes}</div>
    `;

    const buttons = document.createElement('div');
    buttons.className = compact ? 'mobile-reflex-grade-buttons inline' : 'reflex-grade-buttons inline';

    Object.entries(REFLEX_GRADES).forEach(([grade, gradeDef]) => {
      const btn = document.createElement('button');
      btn.className = compact ? 'mobile-grade-btn' : 'reflex-grade-btn';
      btn.dataset.grade = grade;
      btn.dataset.reflexId = reflexDef.id;
      btn.dataset.side = hotspotData.side;
      btn.title = gradeDef.description;
      const gradeLabel = gradeDef.label.replace(` (${gradeDef.shortLabel})`, '');
      btn.innerHTML = `<span class="grade-symbol">${gradeDef.shortLabel}</span><span class="grade-label">${compact ? gradeDef.description : gradeLabel}</span>`;
      btn.classList.toggle('active', currentTest?.value === grade);
      buttons.appendChild(btn);
    });

    row.appendChild(details);
    row.appendChild(buttons);
    container.appendChild(row);
  });
}

function renderPyramidalRows(container, hotspotData) {
  container.innerHTML = '';
  const signs = getPyramidalSignsForHotspot(hotspotData);

  signs.forEach(signDef => {
    const currentSign = getPyramidalSign(signDef.id, hotspotData.side);
    const row = document.createElement('div');
    row.className = 'exam-test-row pyramidal';

    const details = document.createElement('div');
    details.className = 'exam-test-details';
    details.innerHTML = `
      <div class="exam-test-name">${signDef.label}</div>
      <div class="exam-test-meta">${signDef.description}</div>
      <div class="exam-test-notes">${signDef.testingNotes}</div>
    `;

    const label = document.createElement('label');
    label.className = 'checkbox-label present-toggle';
    label.innerHTML = `
      <input type="checkbox" data-sign="${signDef.id}" data-side="${hotspotData.side}" ${currentSign?.isPresent ? 'checked' : ''}>
      <span>Present</span>
    `;

    row.appendChild(details);
    row.appendChild(label);
    container.appendChild(row);
  });
}

function showDesktopExamPanel(hotspotData) {
  const panel = document.getElementById('reflex-panel');
  if (!panel) return;

  const isPyramidal = hotspotData.type === 'pyramidalHotspot';
  const panelBody = document.getElementById('exam-panel-body');
  const titleEl = document.getElementById('reflex-name');
  const sideEl = document.getElementById('reflex-side');
  const modeEl = document.getElementById('exam-panel-mode');

  if (titleEl) titleEl.textContent = hotspotData.definition.label;
  if (sideEl) sideEl.textContent = getSideLabel(hotspotData.side);
  if (modeEl) modeEl.textContent = isPyramidal ? 'Pyramidal signs exam' : 'Reflex exam';

  const settingsSection = document.getElementById('settings-section');
  if (settingsSection) settingsSection.open = false;

  panel.dataset.hotspotType = hotspotData.type;
  panel.dataset.hotspotId = hotspotData.hotspotId;
  panel.dataset.side = hotspotData.side;

  if (panelBody) {
    if (isPyramidal) {
      renderPyramidalRows(panelBody, hotspotData);
    } else {
      renderReflexRows(panelBody, hotspotData);
    }
  }

  panel.classList.remove('hidden');

  const selectionCard = document.getElementById('selection-card');
  if (selectionCard) selectionCard.classList.add('hidden');
}

function showMobileExamSheet(hotspotData) {
  const sheet = document.getElementById('mobile-reflex-sheet');
  if (!sheet) return;

  const isPyramidal = hotspotData.type === 'pyramidalHotspot';
  const nameEl = document.getElementById('mobile-reflex-name');
  const modeEl = document.getElementById('mobile-exam-mode');
  const body = document.getElementById('mobile-exam-body');

  if (nameEl) nameEl.textContent = `${hotspotData.definition.label} (${hotspotData.side})`;
  if (modeEl) modeEl.textContent = isPyramidal ? 'Pyramidal signs exam' : 'Reflex exam';

  sheet.dataset.hotspotType = hotspotData.type;
  sheet.dataset.hotspotId = hotspotData.hotspotId;
  sheet.dataset.side = hotspotData.side;

  if (body) {
    if (isPyramidal) {
      renderPyramidalRows(body, hotspotData);
    } else {
      renderReflexRows(body, hotspotData, true);
    }
  }

  sheet.classList.remove('hidden');
}

function hideReflexPanel() {
  const panel = document.getElementById('reflex-panel');
  if (panel) panel.classList.add('hidden');

  const mobileSheet = document.getElementById('mobile-reflex-sheet');
  if (mobileSheet) mobileSheet.classList.add('hidden');

  if (selectedReflexHotspot) {
    selectedReflexHotspot.userData.isSelected = false;
    updateHotspotAppearance(selectedReflexHotspot);
  }
  selectedReflexHotspot = null;

  const settingsSection = document.getElementById('settings-section');
  if (settingsSection) settingsSection.open = true;
}

function refreshExamHotspotAppearances() {
  if (reflexHotspots) {
    reflexHotspots.forEach(hotspot => updateHotspotAppearance(hotspot));
  }
  if (pyramidalHotspots) {
    pyramidalHotspots.forEach(hotspot => updateHotspotAppearance(hotspot));
  }
}

function hideMobileSheet() {
  mobileSheet.classList.remove('active');
  mobileSheet.setAttribute('aria-hidden', 'true');
  mobileBackdrop.classList.remove('active');
  mobileBackdrop.setAttribute('aria-hidden', 'true');

  if (selectedMesh) {
    resetMeshAppearance(selectedMesh);
    selectedMesh = null;
  }

  updateMuscleListSelection();
}

function updateMobileRatingButtons(activeStrength) {
  document.querySelectorAll('.mobile-rating-btn').forEach(btn => {
    const r = parseInt(btn.dataset.rating);
    btn.classList.toggle('active', r === activeStrength);
  });
  if (activeStrength > 0) {
    const level = STRENGTH_LEVELS[activeStrength];
    mobileCurrentRatingLabel.textContent = `${level.label} (${activeStrength}/5)`;
  } else {
    mobileCurrentRatingLabel.textContent = 'Not rated';
  }
}

// Mobile sheet event listeners
mobileSheetClose.addEventListener('click', hideMobileSheet);
mobileBackdrop.addEventListener('click', hideMobileSheet);

// Swipe to dismiss gesture for mobile sheet
let sheetStartY = 0;
let sheetCurrentY = 0;
let sheetIsDragging = false;

const sheetHandle = document.querySelector('.sheet-handle');
if (sheetHandle) {
  sheetHandle.addEventListener('touchstart', (e) => {
    sheetStartY = e.touches[0].clientY;
    sheetIsDragging = true;
    mobileSheet.style.transition = 'none';
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!sheetIsDragging || !mobileSheet.classList.contains('active')) return;

    sheetCurrentY = e.touches[0].clientY;
    const deltaY = sheetCurrentY - sheetStartY;

    // Only allow dragging down
    if (deltaY > 0) {
      mobileSheet.style.transform = `translateY(${deltaY}px)`;
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (!sheetIsDragging) return;

    sheetIsDragging = false;
    mobileSheet.style.transition = '';

    const deltaY = sheetCurrentY - sheetStartY;

    // If dragged down more than 100px, dismiss
    if (deltaY > 100) {
      hideMobileSheet();
    }

    // Reset transform
    mobileSheet.style.transform = '';
  }, { passive: true });
}

// Mobile rating button handlers
document.querySelectorAll('.mobile-rating-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!selectedMesh) return;
    const strength = parseInt(btn.dataset.rating);
    rateMuscle(selectedMesh, strength);
    updateMobileRatingButtons(strength);
  });
});

// Mobile hide part button
document.getElementById('mobile-btn-hide-part').addEventListener('click', () => {
  if (!selectedMesh) return;

  hiddenMeshes.add(selectedMesh);
  selectedMesh.visible = false;
  resetMeshAppearance(selectedMesh);
  selectedMesh = null;
  hideMobileSheet();
  updateHiddenUI();
  invalidateVisibleMeshes();
});

// Mobile clear rating button
document.getElementById('mobile-btn-clear-rating').addEventListener('click', () => {
  if (!selectedMesh) return;
  const ratingKey = selectedMesh.userData.ratingKey;
  const rating = getRating(ratingKey);

  if (!rating) return;

  showConfirmModal(
    'Clear Rating',
    `Clear rating for ${ratingKey}?`,
    () => {
      setRating(ratingKey, null);

      const meshes = ratingKeyToMeshes.get(ratingKey) || [];
      for (const mesh of meshes) {
        if (mesh !== selectedMesh) {
          mesh.material = mesh.userData.originalMaterial;
        }
      }

      updateMobileRatingButtons(0);
      updateMuscleListRatings();
      updateProgressChip();
      updateStatsFooter();
    }
  );
});

function getAnatomySearchTerm(rawName) {
  let term = rawName.toLowerCase()
    .replace(/\s*\(\d+\)\s*$/, '')
    .replace(/_/g, ' ')
    .replace(/\b(left|right)\b/g, '')
    .replace(/\b\w+\s+part\s+of\s+/g, '')
    .replace(/\b\w+\s+head\s+of\s+/g, '')
    .replace(/\b\w+\s+belly\s+of\s+/g, '')
    .replace(/\bset\s+of\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return term;
}

function hideInfoPanel() {
  if (isMobile()) {
    hideMobileSheet();
  } else {
    selectionCard.classList.add('hidden');
    updateMuscleListSelection();
  }
  applyExamSelectionFocus();
}

function updateRatingButtons(activeStrength) {
  document.querySelectorAll('.rating-btn').forEach(btn => {
    const r = parseInt(btn.dataset.rating);
    btn.classList.toggle('active', r === activeStrength);
  });
  if (activeStrength > 0) {
    const level = STRENGTH_LEVELS[activeStrength];
    currentRatingLabel.textContent = `${level.label} (${activeStrength}/5)`;
  } else {
    currentRatingLabel.textContent = 'Not rated';
  }
}

// Rating button click handlers
document.querySelectorAll('.rating-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!selectedMesh) return;
    const strength = parseInt(btn.dataset.rating);
    rateMuscle(selectedMesh, strength);
    updateRatingButtons(strength);
  });
});

// Clear rating button
document.getElementById('btn-clear-rating').addEventListener('click', () => {
  if (!selectedMesh) return;
  const ratingKey = selectedMesh.userData.ratingKey;
  const rating = getRating(ratingKey);

  if (!rating) return; // Nothing to clear

  showConfirmModal(
    'Clear Rating',
    `Clear rating for ${ratingKey}?`,
    () => {
      // Clear the rating
      setRating(ratingKey, null);

      // Reset material for all meshes with this rating key
      const meshes = ratingKeyToMeshes.get(ratingKey) || [];
      for (const mesh of meshes) {
        if (mesh !== selectedMesh) {
          mesh.material = mesh.userData.originalMaterial;
        }
      }

      // Update UI
      updateRatingButtons(0);
      updateMuscleListRatings();
      updateProgressChip();
      updateStatsFooter();
    }
  );
});

// ───────────── Hide / Show Parts ─────────────

const btnHidePart = document.getElementById('btn-hide-part');
const hiddenPanel = document.getElementById('hidden-panel');
const hiddenCountSpan = document.getElementById('hidden-count');
const hiddenList = document.getElementById('hidden-list');
const btnShowAll = document.getElementById('btn-show-all');

function updateHiddenUI() {
  hiddenCountSpan.textContent = hiddenMeshes.size;
  if (hiddenMeshes.size > 0) {
    hiddenPanel.classList.remove('hidden');
  } else {
    hiddenPanel.classList.add('hidden');
  }

  hiddenList.innerHTML = '';
  for (const mesh of hiddenMeshes) {
    const li = document.createElement('li');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'hidden-part-name';
    nameSpan.textContent = mesh.userData.displayName;
    nameSpan.title = mesh.userData.displayName;
    li.appendChild(nameSpan);

    const btn = document.createElement('button');
    btn.textContent = 'Show';
    btn.addEventListener('click', () => {
      hiddenMeshes.delete(mesh);
      updateMuscleVisibility();
      updateHiddenUI();
    });
    li.appendChild(btn);

    hiddenList.appendChild(li);
  }
}

btnHidePart.addEventListener('click', () => {
  if (!selectedMesh) return;

  hiddenMeshes.add(selectedMesh);
  selectedMesh.visible = false;
  resetMeshAppearance(selectedMesh);
  selectedMesh = null;
  hideInfoPanel();
  updateHiddenUI();
  invalidateVisibleMeshes();
});

btnShowAll.addEventListener('click', () => {
  hiddenMeshes.clear();
  updateMuscleVisibility();
  updateHiddenUI();
});

// ───────────── UI Controls ─────────────

// Search
const searchInput = document.getElementById('search');
const searchResults = document.getElementById('search-results');

let searchDebounceTimer = null;
let selectedResultIndex = -1;

searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    const query = searchInput.value.toLowerCase().trim();
    searchResults.innerHTML = '';
    selectedResultIndex = -1;

    if (query.length < 2 || muscleMeshes.length === 0) return;

    if (APP_MODE === 'examination') {
      const matches = orderedExamEntries
        .map((entry, index) => ({ entry, index }))
        .filter(({ entry }) => entry.label.toLowerCase().includes(query));

      if (matches.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'search-empty';
        emptyState.innerHTML = `
          <span class="search-empty-icon">🔍</span>
          <p>No muscles found for "${query}"</p>
        `;
        searchResults.appendChild(emptyState);
        return;
      }

      const countHeader = document.createElement('div');
      countHeader.className = 'search-count';
      countHeader.textContent = `${matches.length} result${matches.length !== 1 ? 's' : ''}`;
      searchResults.appendChild(countHeader);

      for (const { entry, index } of matches.slice(0, 50)) {
        const div = document.createElement('div');
        div.className = 'search-item';
        div.textContent = entry.label;
        div.addEventListener('click', () => {
          selectExamEntry(index);
          searchInput.value = '';
          searchResults.innerHTML = '';
          selectedResultIndex = -1;
        });
        searchResults.appendChild(div);
      }

      return;
    }

    const matches = muscleMeshes.filter((m) =>
      m.userData.displayName.toLowerCase().includes(query)
    );

    // Show ALL results with count indicator
    const resultCount = matches.length;
    const maxDisplay = 50; // Reasonable limit for performance

    if (resultCount === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'search-empty';
      emptyState.innerHTML = `
        <span class="search-empty-icon">🔍</span>
        <p>No muscles found for "${query}"</p>
      `;
      searchResults.appendChild(emptyState);
      return;
    }

    // Add result count header
    const countHeader = document.createElement('div');
    countHeader.className = 'search-count';
    countHeader.textContent = `${resultCount} result${resultCount !== 1 ? 's' : ''}`;
    searchResults.appendChild(countHeader);

    const displayMatches = matches.slice(0, maxDisplay);

    for (const mesh of displayMatches) {
      const div = document.createElement('div');
      div.className = 'search-item';
      div.textContent = mesh.userData.displayName;
      div.addEventListener('click', () => {
        if (selectedMesh) resetMeshAppearance(selectedMesh);
        selectedMesh = mesh;
        selectedExamEntryIndex = -1;
        mesh.material = selectedMaterial;
        showInfoPanel(mesh.userData);
        searchInput.value = '';
        searchResults.innerHTML = '';
        selectedResultIndex = -1;
        updateWorkflowButtons();
        zoomToMesh(mesh);
      });
      searchResults.appendChild(div);
    }

    // Add "X more" indicator if truncated
    if (resultCount > maxDisplay) {
      const moreDiv = document.createElement('div');
      moreDiv.className = 'search-more';
      moreDiv.textContent = `+ ${resultCount - maxDisplay} more (refine search)`;
      searchResults.appendChild(moreDiv);
    }
  }, 150);
});

// Keyboard navigation for search
searchInput.addEventListener('keydown', (e) => {
  const items = searchResults.querySelectorAll('.search-item');
  if (items.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedResultIndex = Math.min(selectedResultIndex + 1, items.length - 1);
    updateSelectedResult(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedResultIndex = Math.max(selectedResultIndex - 1, -1);
    updateSelectedResult(items);
  } else if (e.key === 'Enter' && selectedResultIndex >= 0) {
    e.preventDefault();
    items[selectedResultIndex].click();
  } else if (e.key === 'Escape') {
    searchResults.innerHTML = '';
    searchInput.value = '';
    selectedResultIndex = -1;
  }
});

function updateSelectedResult(items) {
  items.forEach((item, i) => {
    item.classList.toggle('selected', i === selectedResultIndex);
  });
  if (selectedResultIndex >= 0) {
    items[selectedResultIndex].scrollIntoView({ block: 'nearest' });
  }
}

function getSelectionCameraLookDirection(mesh) {
  const data = mesh?.userData?.muscleData;
  if (!data) return null;

  const rawName = (data.rawName || '').toLowerCase();
  const group = data.group || '';

  if (group === 'BACK') return new THREE.Vector3(0, 0, 1);

  const posteriorKeywords = [
    'triceps brachii',
    'anconeus',
    'latissimus',
    'rhomboid',
    'trapezius',
    'multifidus',
    'semispinalis',
    'spinalis',
    'erector spinae',
    'splenius',
    'quadratus lumborum',
    'thoracolumbar fascia'
  ];

  if (posteriorKeywords.some(keyword => rawName.includes(keyword))) {
    return new THREE.Vector3(0, 0, 1);
  }

  return null;
}

function zoomToMesh(mesh) {
  mesh.geometry.computeBoundingBox();
  const box = mesh.geometry.boundingBox;
  const center = new THREE.Vector3();
  box.getCenter(center);
  mesh.localToWorld(center);

  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const zoomDist = Math.max(maxDim * 3, 8);

  const lookDirection = getSelectionCameraLookDirection(mesh) || (() => {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    return dir;
  })();
  const targetPos = center.clone().sub(lookDirection.multiplyScalar(zoomDist));

  animateCamera(targetPos, center, 1000);
}

// ───────────── Grouping Mode Toggle ─────────────

const filterContainer = document.getElementById('muscle-group-filters');
const activeFilters = new Set();

const btnGroupAnatomy = document.getElementById('btn-group-anatomy');
const btnGroupNerve = document.getElementById('btn-group-nerve');

btnGroupAnatomy.addEventListener('click', () => {
  if (groupingMode === 'anatomy') return;
  groupingMode = 'anatomy';
  btnGroupAnatomy.classList.add('active');
  btnGroupNerve.classList.remove('active');
  rebuildFilters();
  rebuildMuscleList();
});

btnGroupNerve.addEventListener('click', () => {
  if (groupingMode === 'nerve') return;
  groupingMode = 'nerve';
  btnGroupNerve.classList.add('active');
  btnGroupAnatomy.classList.remove('active');
  rebuildFilters();
  rebuildMuscleList();
});

// Priority filter section (only active in exploration mode)
const priorityFilterSection = document.getElementById('priority-filter-section');

// Priority filter buttons
const btnAllMuscles = document.getElementById('btn-all-muscles');
const btnPriorityOnly = document.getElementById('btn-priority-only');

if (btnAllMuscles) {
  btnAllMuscles.addEventListener('click', () => {
    if (priorityFilter === 'all') return;
    priorityFilter = 'all';
    localStorage.setItem('myoatlas_priority_filter', priorityFilter);
    btnAllMuscles.classList.add('active');
    btnPriorityOnly.classList.remove('active');
    rebuildMuscleList();
  });
}

if (btnPriorityOnly) {
  btnPriorityOnly.addEventListener('click', () => {
    if (priorityFilter === 'priority') return;
    priorityFilter = 'priority';
    localStorage.setItem('myoatlas_priority_filter', priorityFilter);
    btnPriorityOnly.classList.add('active');
    btnAllMuscles.classList.remove('active');
    rebuildMuscleList();
  });
}

function updatePriorityFilterButtons() {
  if (btnAllMuscles) btnAllMuscles.classList.toggle('active', priorityFilter === 'all');
  if (btnPriorityOnly) btnPriorityOnly.classList.toggle('active', priorityFilter === 'priority');
}

function rebuildFilters() {
  filterContainer.innerHTML = '';
  activeFilters.clear();

  if (groupingMode === 'anatomy') {
    for (const [key, group] of Object.entries(MUSCLE_GROUPS)) {
      activeFilters.add(key);
      const btn = document.createElement('button');
      btn.className = 'filter-chip active';
      btn.textContent = group.label;
      btn.dataset.group = key;
      btn.style.setProperty('--chip-color', group.color);

      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        if (activeFilters.has(key)) {
          activeFilters.delete(key);
        } else {
          activeFilters.add(key);
        }
        updateMuscleVisibility();
      });

      filterContainer.appendChild(btn);
    }
  } else {
    for (const [key, nerve] of Object.entries(NERVE_GROUPS)) {
      activeFilters.add(key);
      const btn = document.createElement('button');
      btn.className = 'filter-chip active';
      btn.textContent = nerve.label;
      btn.dataset.group = key;
      btn.style.setProperty('--chip-color', nerve.color);

      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        if (activeFilters.has(key)) {
          activeFilters.delete(key);
        } else {
          activeFilters.add(key);
        }
        updateMuscleVisibility();
      });

      filterContainer.appendChild(btn);
    }
  }

  updateMuscleVisibility();
}

function updateMuscleVisibility() {
  if (isHotspotExamView() && hideMusclesInReflexMode) {
    for (const mesh of muscleMeshes) {
      mesh.visible = false;
    }
    invalidateVisibleMeshes();
    return;
  }

  for (const mesh of muscleMeshes) {
    if (hiddenMeshes.has(mesh)) {
      mesh.visible = false;
      continue;
    }

    const isTendon = mesh.userData.muscleData.type === 'tendon';
    const tendonVisible = true;

    if (isTendon && !tendonVisible) {
      mesh.visible = false;
      continue;
    }

    if (groupingMode === 'anatomy') {
      const group = mesh.userData.muscleData.group;
      mesh.visible = activeFilters.has(group);
    } else {
      // In nerve mode, show mesh if it belongs to any active nerve
      const rawName = (mesh.userData.muscleData?.rawName || '').toLowerCase();
      const meshNerves = nerveMeshMap.get(rawName) || [];
      if (meshNerves.length === 0) {
        // Not in any nerve group — show it anyway
        mesh.visible = true;
      } else {
        mesh.visible = meshNerves.some(nk => activeFilters.has(nk));
      }
    }
  }
  invalidateVisibleMeshes();
}

// ───────────── Muscle List ─────────────

const muscleListContainer = document.getElementById('muscle-list');
const muscleListCount = document.getElementById('muscle-list-count');
const btnNextMuscle = document.getElementById('btn-next-muscle');
const btnAutoProceed = document.getElementById('btn-auto-proceed');
let orderedExamEntries = [];
let selectedExamEntryIndex = -1;
let autoProceed = localStorage.getItem('myoatlas_auto_proceed') === 'true';
let examListScrollRaf = 0;
const examDimMaterialCache = new WeakMap();

const EXAM_FOCUS_ZONE_RULES = {
  SHOULDER: ['SHOULDER', 'CHEST', 'BACK', 'UPPER_ARM'],
  CHEST: ['CHEST', 'SHOULDER', 'BACK', 'UPPER_ARM'],
  BACK: ['BACK', 'SHOULDER', 'CHEST', 'UPPER_ARM'],
  UPPER_ARM: ['UPPER_ARM', 'SHOULDER', 'FOREARM', 'HAND'],
  FOREARM: ['FOREARM', 'UPPER_ARM', 'HAND'],
  HAND: ['HAND', 'FOREARM'],
  ABDOMEN: ['ABDOMEN', 'HIP', 'UPPER_LEG'],
  HIP: ['HIP', 'UPPER_LEG', 'LOWER_LEG'],
  UPPER_LEG: ['UPPER_LEG', 'HIP', 'LOWER_LEG', 'FOOT'],
  LOWER_LEG: ['LOWER_LEG', 'UPPER_LEG', 'FOOT'],
  FOOT: ['FOOT', 'LOWER_LEG'],
  HEAD_NECK: ['HEAD_NECK'],
  OTHER: ['OTHER']
};

if (btnNextMuscle) {
  btnNextMuscle.addEventListener('click', selectNextExamEntry);
}

if (btnAutoProceed) {
  btnAutoProceed.addEventListener('click', () => {
    autoProceed = !autoProceed;
    localStorage.setItem('myoatlas_auto_proceed', autoProceed.toString());
    updateWorkflowButtons();
  });
}

function rebuildMuscleList() {
  muscleListContainer.innerHTML = '';
  orderedExamEntries = [];
  selectedExamEntryIndex = -1;

  if (APP_MODE === 'examination') {
    rebuildCanonicalExamList();
    updateWorkflowButtons();
    return;
  }

  updatePriorityFilterButtons();
  // Filter rating keys by priority if needed
  let filteredKeys = uniqueRatingKeys;
  if (priorityFilter === 'priority') {
    filteredKeys = uniqueRatingKeys.filter(rk => isPriorityMuscle(rk));
  }

  if (groupingMode === 'anatomy') {
    // Group by anatomy group using deduplicated ratingKeys
    const groups = {};
    for (const rk of filteredKeys) {
      const meshes = ratingKeyToMeshes.get(rk) || [];
      if (meshes.length === 0) continue;
      const group = meshes[0].userData.muscleData.group;
      const groupLabel = MUSCLE_GROUPS[group]?.label || 'Other';
      if (!groups[groupLabel]) groups[groupLabel] = [];
      groups[groupLabel].push(rk);
    }

    let totalCount = 0;
    for (const [groupLabel, keys] of Object.entries(groups)) {
      totalCount += keys.length;
      appendGroupSection(groupLabel, keys);
    }
    muscleListCount.textContent = `(${totalCount})`;
  } else {
    // Group by nerve — only show neuromodell muscles
    let totalCount = 0;
    for (const [nerveKey, nerve] of Object.entries(NERVE_GROUPS)) {
      const keys = [];
      for (const rk of filteredKeys) {
        const rkNerves = ratingKeyToNerves.get(rk.toLowerCase()) || [];
        if (rkNerves.includes(nerveKey)) keys.push(rk);
      }
      if (keys.length === 0) continue;
      totalCount += keys.length;
      appendGroupSection(nerve.label, keys);
    }
    muscleListCount.textContent = `(${totalCount})`;
  }
}

function rebuildCanonicalExamList() {
  let totalCount = 0;

  for (const group of EXAM_MUSCLE_GROUPS) {
    const entries = group.entries
      .map(entry => {
        const meshes = findMeshesForExamEntry(entry);
        return {
          ...entry,
          meshes,
          meshIds: [...new Set(meshes.map(mesh => mesh.userData.meshId).filter(Boolean))],
        };
      });

    totalCount += entries.length;
    appendExamGroupSection(group.heading, entries);
  }

  muscleListCount.textContent = `(${totalCount})`;
}

function getExamEntryPatternGroups(entry) {
  return entry.patternGroups || [entry.patterns || []];
}

function findMeshesForExamEntry(entry) {
  const exactNames = new Set((entry.meshNames || []).map(normalizeExamLookupKey));
  const exactIds = new Set((entry.meshIds || []).map(normalizeExamLookupKey));
  const patternGroups = getExamEntryPatternGroups(entry)
    .map(group => group.map(normalizeExamLookupKey))
    .filter(group => group.length > 0);
  const matches = [];

  for (const mesh of muscleMeshes) {
    const candidates = getMeshMatchCandidates(mesh);
    if (candidates.length === 0) continue;

    if ((entry.exclude || []).some(pattern => candidates.some(candidate => candidate.includes(normalizeExamLookupKey(pattern))))) {
      continue;
    }

    if (candidates.some(candidate => exactIds.has(candidate) || exactNames.has(candidate))) {
      matches.push(mesh);
      continue;
    }

    if (patternGroups.some(patterns => patterns.every(pattern =>
      candidates.some(candidate => candidate.includes(pattern))
    ))) {
      matches.push(mesh);
    }
  }

  return matches;
}

function getExamEntryRatingKeys(entry) {
  return [...new Set(entry.meshes.map(mesh => mesh.userData.ratingKey).filter(Boolean))];
}

function normalizeExamLookupKey(value) {
  return (value || '')
    .toLowerCase()
    .replace(/\s*\(\d+\)\s*$/g, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getMeshMatchCandidates(mesh) {
  const meta = mesh.userData.meshMapping || {};
  return [
    mesh.userData.meshId,
    mesh.userData.fmaId,
    mesh.userData.bpId,
    mesh.userData.muscleData?.meshId,
    mesh.userData.muscleData?.fmaId,
    mesh.userData.muscleData?.bpId,
    meta.meshId,
    meta.fmaId,
    meta.bpId,
    meta.name,
    meta.originalName,
    mesh.userData.muscleData?.meshName,
    mesh.userData.muscleData?.rawName,
    mesh.userData.displayName,
    mesh.name,
  ]
    .map(normalizeExamLookupKey)
    .filter(Boolean);
}

function getExamEntryRating(entry) {
  const ratingKeys = getExamEntryRatingKeys(entry);
  const ratings = ratingKeys.map(key => getRating(key)?.strength).filter(Boolean);
  if (ratings.length === 0) return null;
  return ratings.every(value => value === ratings[0]) ? { strength: ratings[0] } : { mixed: true };
}

function appendExamGroupSection(label, entries) {
  const header = document.createElement('div');
  header.className = 'muscle-group-header';
  header.innerHTML = `<span>${label}</span><span class="collapse-icon">&#9660;</span>`;

  const items = document.createElement('div');
  items.className = 'muscle-group-items';

  entries.forEach(entry => {
    const index = orderedExamEntries.length;
    orderedExamEntries.push(entry);

    const item = document.createElement('div');
    item.className = 'muscle-list-item canonical';
    item.dataset.examIndex = index.toString();
    item.classList.toggle('unavailable', entry.meshes.length === 0);

    const rating = getExamEntryRating(entry);
    if (rating?.strength) item.setAttribute('data-rating', rating.strength);
    if (rating?.mixed) item.classList.add('mixed-rating');

    const name = document.createElement('span');
    name.className = 'muscle-list-name';
    name.textContent = entry.label;
    name.title = entry.meshes.length > 0 ? entry.label : `${entry.label} (no mesh available)`;
    item.appendChild(name);

    if (entry.meshes.length === 0) {
      const missing = document.createElement('span');
      missing.className = 'missing-mesh-badge';
      missing.textContent = 'No mesh';
      item.appendChild(missing);
    } else {
      item.addEventListener('click', () => selectExamEntry(index));
    }
    items.appendChild(item);
  });

  header.addEventListener('click', () => {
    header.classList.toggle('collapsed');
    items.classList.toggle('collapsed');
  });

  muscleListContainer.appendChild(header);
  muscleListContainer.appendChild(items);
}

function selectExamEntry(index) {
  const entry = orderedExamEntries[index];
  if (!entry) return;

  if (selectedExamEntryIndex === index && selectedMesh) {
    clearCurrentSelection();
    return;
  }

  const mesh = entry.meshes.find(m => m.visible) || entry.meshes[0];
  if (!mesh) return;

  if (selectedMesh) resetMeshAppearance(selectedMesh);
  selectedMesh = mesh;
  selectedExamEntryIndex = index;
  mesh.material = selectedMaterial;
  showInfoPanel(mesh.userData);
  updateMuscleListSelection();
  updateWorkflowButtons();
  applyExamSelectionFocus();
  zoomToMesh(mesh);
}

function selectNextExamEntry() {
  if (orderedExamEntries.length === 0) return;

  const startIndex = selectedExamEntryIndex < 0 ? 0 : selectedExamEntryIndex + 1;
  const nextIndex = orderedExamEntries.findIndex((entry, index) =>
    index >= startIndex && entry.meshes.length > 0
  );

  if (nextIndex >= 0) selectExamEntry(nextIndex);
}

function updateWorkflowButtons() {
  if (btnAutoProceed) {
    btnAutoProceed.classList.toggle('active', autoProceed);
    btnAutoProceed.setAttribute('aria-pressed', autoProceed ? 'true' : 'false');
  }

  if (btnNextMuscle) {
    btnNextMuscle.disabled = !orderedExamEntries.some((entry, index) =>
      entry.meshes.length > 0 && index > selectedExamEntryIndex
    );
  }
}

function appendGroupSection(label, ratingKeys) {
  const header = document.createElement('div');
  header.className = 'muscle-group-header';
  header.innerHTML = `<span>${label}</span><span class="collapse-icon">&#9660;</span>`;

  const items = document.createElement('div');
  items.className = 'muscle-group-items';

  for (const rk of ratingKeys) {
    const item = document.createElement('div');
    item.className = 'muscle-list-item';
    item.dataset.ratingKey = rk;

    // Set data-rating attribute for CSS styling (no dots)
    const rating = getRating(rk);
    if (rating) {
      item.setAttribute('data-rating', rating.strength);
    }

    const name = document.createElement('span');
    name.className = 'muscle-list-name';
    name.textContent = rk;
    name.title = rk;

    // No longer using dot - background tint via CSS data-rating attribute
    item.appendChild(name);

    // Add priority star if this is a priority muscle
    if (isPriorityMuscle(rk)) {
      const star = document.createElement('span');
      star.className = 'priority-star';
      star.innerHTML = '★';
      star.title = 'Priority muscle';
      item.appendChild(star);
    }

    item.addEventListener('click', () => {
      const meshes = ratingKeyToMeshes.get(rk) || [];
      const mesh = meshes.find(m => m.visible) || meshes[0];
      if (!mesh) return;

      if (selectedMesh === mesh && selectedExamEntryIndex === -1) {
        clearCurrentSelection();
        return;
      }

      if (selectedMesh) resetMeshAppearance(selectedMesh);
      selectedMesh = mesh;
      selectedExamEntryIndex = -1;
      mesh.material = selectedMaterial;
      showInfoPanel(mesh.userData);
      updateWorkflowButtons();
      zoomToMesh(mesh);
    });

    items.appendChild(item);
  }

  // Collapse toggle
  header.addEventListener('click', () => {
    header.classList.toggle('collapsed');
    items.classList.toggle('collapsed');
  });

  muscleListContainer.appendChild(header);
  muscleListContainer.appendChild(items);
}

function updateMuscleListSelection() {
  const rk = selectedMesh?.userData.ratingKey || '';
  document.querySelectorAll('.muscle-list-item').forEach(item => {
    if (item.dataset.examIndex !== undefined) {
      item.classList.toggle('selected', parseInt(item.dataset.examIndex) === selectedExamEntryIndex);
    } else {
      item.classList.toggle('selected', item.dataset.ratingKey === rk);
    }
  });

  scrollSelectedExamEntryIntoView();
}

function updateMuscleListRatings() {
  document.querySelectorAll('.muscle-list-item').forEach(item => {
    if (item.dataset.examIndex !== undefined) {
      const entry = orderedExamEntries[parseInt(item.dataset.examIndex)];
      const rating = entry ? getExamEntryRating(entry) : null;

      if (rating?.strength) {
        item.setAttribute('data-rating', rating.strength);
        item.classList.remove('mixed-rating');
      } else {
        item.removeAttribute('data-rating');
        item.classList.toggle('mixed-rating', rating?.mixed || false);
      }
      return;
    }

    const rk = item.dataset.ratingKey;
    const rating = getRating(rk);

    // Update data-rating attribute for CSS styling
    if (rating) {
      item.setAttribute('data-rating', rating.strength);
    } else {
      item.removeAttribute('data-rating');
    }
  });

  scrollSelectedExamEntryIntoView();
}

function scrollSelectedExamEntryIntoView() {
  if (examListScrollRaf) cancelAnimationFrame(examListScrollRaf);
  examListScrollRaf = requestAnimationFrame(() => {
    const selectedItem = document.querySelector('.muscle-list-item.canonical.selected');
    selectedItem?.scrollIntoView({ block: 'nearest' });
    examListScrollRaf = 0;
  });
}

function applyExamSelectionFocus() {
  if (APP_MODE !== 'examination' || examView !== 'muscle') {
    for (const mesh of muscleMeshes) {
      resetMeshAppearance(mesh);
    }
    invalidateVisibleMeshes();
    return;
  }

  const focusEntry = orderedExamEntries[selectedExamEntryIndex] || null;
  const focusRatingKeys = new Set(
    focusEntry
      ? getExamEntryRatingKeys(focusEntry)
      : (selectedMesh?.userData.ratingKey ? [selectedMesh.userData.ratingKey] : [])
  );
  const focusZones = getExamFocusZones(focusEntry?.meshes?.[0] || selectedMesh);

  if (focusRatingKeys.size === 0) {
    for (const mesh of muscleMeshes) {
      resetMeshAppearance(mesh);
    }
    invalidateVisibleMeshes();
    return;
  }

  for (const mesh of muscleMeshes) {
    const rk = mesh.userData.ratingKey;
    const meshZone = getExamMeshZone(mesh);
    const inFocusZone = focusZones.size === 0 || focusZones.has(meshZone);

    if (rk && focusRatingKeys.has(rk)) {
      const rating = getRating(rk);
      mesh.material = mesh === selectedMesh
        ? selectedMaterial
        : rating
          ? getRatingMaterial(rating.strength)
          : mesh.userData.originalMaterial;
      continue;
    }

    if (!inFocusZone) {
      resetMeshAppearance(mesh);
      continue;
    }

    const originalMaterial = mesh.userData.originalMaterial;
    if (!originalMaterial) continue;

    let dimmedMap = examDimMaterialCache.get(originalMaterial);
    if (!dimmedMap) {
      dimmedMap = new Map();
      examDimMaterialCache.set(originalMaterial, dimmedMap);
    }

    const opacityKey = '0.35';
    if (!dimmedMap.has(opacityKey)) {
      const dimmed = originalMaterial.clone();
      dimmed.transparent = true;
      dimmed.opacity = 0.35;
      dimmed.depthWrite = false;
      dimmedMap.set(opacityKey, dimmed);
    }

    mesh.material = dimmedMap.get(opacityKey);
  }

  invalidateVisibleMeshes();
}

function getExamMeshZone(mesh) {
  return mesh?.userData?.muscleData?.group || 'OTHER';
}

function getExamFocusZones(mesh) {
  const zone = getExamMeshZone(mesh);
  return new Set(EXAM_FOCUS_ZONE_RULES[zone] || [zone]);
}

// ───────────── View Buttons ─────────────

document.getElementById('btn-front').addEventListener('click', () => {
  const dist = defaultCameraPos.distanceTo(defaultLookAt);
  animateCamera(
    new THREE.Vector3(defaultLookAt.x, defaultLookAt.y, defaultLookAt.z + dist),
    defaultLookAt.clone(), 800
  );
});

document.getElementById('btn-back').addEventListener('click', () => {
  const dist = defaultCameraPos.distanceTo(defaultLookAt);
  animateCamera(
    new THREE.Vector3(defaultLookAt.x, defaultLookAt.y, defaultLookAt.z - dist),
    defaultLookAt.clone(), 800
  );
});

document.getElementById('btn-side').addEventListener('click', () => {
  const dist = defaultCameraPos.distanceTo(defaultLookAt);
  animateCamera(
    new THREE.Vector3(defaultLookAt.x + dist, defaultLookAt.y, defaultLookAt.z),
    defaultLookAt.clone(), 800
  );
});

document.getElementById('btn-reset').addEventListener('click', resetView);

function resetView() {
  animateCamera(defaultCameraPos.clone(), defaultLookAt.clone(), 800);
  groupingMode = 'anatomy';
  btnGroupAnatomy.classList.add('active');
  btnGroupNerve.classList.remove('active');
  rebuildFilters();
  rebuildMuscleList();

  hiddenMeshes.clear();
  updateHiddenUI();
  if (selectedMesh) {
    resetMeshAppearance(selectedMesh);
    selectedMesh = null;
  }
  if (selectedReflexHotspot) {
    selectedReflexHotspot.userData.isSelected = false;
    updateHotspotAppearance(selectedReflexHotspot);
    selectedReflexHotspot = null;
  }
  selectedExamEntryIndex = -1;
  hideReflexPanel();
  hideInfoPanel();
  updateWorkflowButtons();
  applyExamSelectionFocus();
}

function animateCamera(targetPosition, lookAtTarget, duration) {
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = performance.now();

  function update() {
    const elapsed = performance.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    camera.position.lerpVectors(startPosition, targetPosition, ease);
    controls.target.lerpVectors(startTarget, lookAtTarget, ease);
    controls.update();

    if (t < 1) requestAnimationFrame(update);
  }
  update();
}

function setPressedButton(button, isPressed) {
  if (!button) return;
  button.classList.toggle('active', isPressed);
  button.setAttribute('aria-pressed', isPressed ? 'true' : 'false');
}

function isPressedButton(button) {
  return button?.classList.contains('active') || false;
}

// ───────────── Mobile Menu Toggles ─────────────

const mobileMenuLeft = document.getElementById('mobile-menu-left');
const mobileMenuRight = document.getElementById('mobile-menu-right');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');
const leftSidebar = document.getElementById('left-sidebar');
const rightSidebar = document.getElementById('sidebar');

function closeSidebars() {
  leftSidebar.classList.remove('active');
  rightSidebar.classList.remove('active');
  sidebarBackdrop.classList.remove('active');
}

if (mobileMenuLeft) {
  mobileMenuLeft.addEventListener('click', () => {
    const isActive = leftSidebar.classList.contains('active');
    closeSidebars();
    if (!isActive) {
      leftSidebar.classList.add('active');
      sidebarBackdrop.classList.add('active');
    }
  });
}

if (mobileMenuRight) {
  mobileMenuRight.addEventListener('click', () => {
    const isActive = rightSidebar.classList.contains('active');
    closeSidebars();
    if (!isActive) {
      rightSidebar.classList.add('active');
      sidebarBackdrop.classList.add('active');
    }
  });
}

if (sidebarBackdrop) {
  sidebarBackdrop.addEventListener('click', closeSidebars);
}

// ───────────── Mobile FAB Menu ─────────────

const fabMenu = document.getElementById('mobile-fab-menu');
const fabTrigger = document.getElementById('fab-trigger');

if (fabTrigger) {
  fabTrigger.addEventListener('click', () => {
    fabMenu.classList.toggle('active');
  });

  // Close FAB menu when clicking outside
  document.addEventListener('click', (e) => {
    if (fabMenu.classList.contains('active') && !fabMenu.contains(e.target)) {
      fabMenu.classList.remove('active');
    }
  });
}

// FAB action handlers
document.getElementById('fab-action-export-json').addEventListener('click', () => {
  exportJSON(uniqueRatingKeys.length, ratingKeyToNerves);
  fabMenu.classList.remove('active');
});

document.getElementById('fab-action-export-pdf').addEventListener('click', () => {
  exportPDF(uniqueRatingKeys.length, ratingKeyToNerves);
  fabMenu.classList.remove('active');
});

document.getElementById('fab-action-reset').addEventListener('click', () => {
  resetView();
  fabMenu.classList.remove('active');
});

document.getElementById('fab-action-clear').addEventListener('click', () => {
  document.getElementById('btn-clear-all').click();
  fabMenu.classList.remove('active');
});

// ───────────── Export & Clear ─────────────

document.getElementById('btn-export-json').addEventListener('click', () => {
  exportJSON(uniqueRatingKeys.length, ratingKeyToNerves);
});

document.getElementById('btn-export-pdf').addEventListener('click', () => {
  exportPDF(uniqueRatingKeys.length, ratingKeyToNerves);
});

// Custom confirmation modal
function showConfirmModal(title, message, onConfirm) {
  const modal = document.getElementById('confirm-modal');
  const titleEl = document.getElementById('confirm-title');
  const messageEl = document.getElementById('confirm-message');
  const cancelBtn = document.getElementById('confirm-cancel');
  const confirmBtn = document.getElementById('confirm-ok');

  titleEl.textContent = title;
  messageEl.textContent = message;
  modal.classList.remove('hidden');

  const cleanup = () => {
    modal.classList.add('hidden');
    cancelBtn.removeEventListener('click', onCancel);
    confirmBtn.removeEventListener('click', onConfirmClick);
    modal.removeEventListener('click', onModalClick);
  };

  const onCancel = () => cleanup();
  const onConfirmClick = () => {
    cleanup();
    onConfirm();
  };
  const onModalClick = (e) => {
    if (e.target === modal) cleanup();
  };

  cancelBtn.addEventListener('click', onCancel);
  confirmBtn.addEventListener('click', onConfirmClick);
  modal.addEventListener('click', onModalClick);
}

document.getElementById('btn-clear-all').addEventListener('click', () => {
  const ratedCount = Object.keys(getAllRatings()).length;

  showConfirmModal(
    'Clear All Data',
    `Are you sure you want to clear all muscle ratings, reflex test results, and pyramidal signs? This cannot be undone.`,
    () => {
      // Clear muscle ratings
      clearAllRatings();
      for (const mesh of muscleMeshes) {
        if (mesh !== selectedMesh) {
          mesh.material = mesh.userData.originalMaterial;
        }
      }

      // Clear reflex data
      clearAllReflexData();

      // Reset all reflex hotspots to untested appearance
      if (reflexHotspots) {
        reflexHotspots.forEach(hotspot => {
          updateHotspotAppearance(hotspot);
        });
      }
      if (pyramidalHotspots) {
        pyramidalHotspots.forEach(hotspot => {
          updateHotspotAppearance(hotspot);
        });
      }

      updateUI();
    }
  );
});

// ───────────── Keyboard Shortcuts ─────────────

document.addEventListener('keydown', (e) => {
  if (document.activeElement === searchInput) return;

  if (e.key >= '1' && e.key <= '5') {
    if (selectedMesh) {
      const strength = parseInt(e.key);
      rateMuscle(selectedMesh, strength);
      updateRatingButtons(strength);
    }
  } else if (e.key === 'Escape') {
    if (selectedMesh || selectedReflexHotspot || selectedExamEntryIndex >= 0) {
      resetView();
    }
  } else if (e.key === 'r' || e.key === 'R') {
    resetView();
  }
});

// ───────────── UI Update Helpers ─────────────

function updateProgressChip() {
  const stats = getRatingStats(uniqueRatingKeys.length);
  const progressText = document.getElementById('progress-text');
  const progressBar = document.getElementById('progress-bar');
  progressText.textContent = `${stats.rated} / ${stats.total} rated`;
  const pct = stats.total > 0 ? (stats.rated / stats.total * 100) : 0;
  progressBar.style.width = `${pct}%`;
}

function updateStatsFooter() {
  const stats = getRatingStats(uniqueRatingKeys.length);
  document.getElementById('stats-rated').textContent = `${stats.rated} rated`;
  document.getElementById('stats-avg').textContent = stats.rated > 0
    ? `Avg: ${stats.average.toFixed(1)}`
    : 'Avg: --';
}

function updateUI() {
  updateProgressChip();
  updateStatsFooter();
  updateMuscleListRatings();

  if (selectedMesh) {
    const rk = selectedMesh.userData.ratingKey;
    const rating = rk ? getRating(rk) : null;
    if (isMobile()) {
      updateMobileRatingButtons(rating?.strength || 0);
    } else {
      updateRatingButtons(rating?.strength || 0);
    }
  }
}

// ───────────── Resize & Orientation ─────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Mobile sheet height is driven by CSS (max-height caps the expanded state,
  // collapsed state hugs content). Landscape cap is handled by the media query.
});

// Handle orientation changes
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, 100);
});

// ───────────── Animation Loop ─────────────

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Pulsing effect on selected material — clinical blue (#60A5FA / #3B82F6)
  if (selectedMesh && selectedMesh.material === selectedMaterial) {
    const time = Date.now() * 0.004;
    const pulse = Math.sin(time) * 0.5 + 0.5; // 0 to 1

    // Emissive pulse driven against the accent hue (#3B82F6 = 0.231, 0.510, 0.965)
    const minEmissive = 0.3;
    const maxEmissive = 1.3;
    const pulseEmissive = minEmissive + (pulse * (maxEmissive - minEmissive));
    selectedMaterial.emissive.setRGB(
      pulseEmissive * 0.231,
      pulseEmissive * 0.510,
      pulseEmissive * 0.965
    );

    // Color breathes between #3B82F6 and #60A5FA
    const tC = 0.4 + pulse * 0.6;
    selectedMaterial.color.setRGB(
      0.231 + (0.376 - 0.231) * tC,
      0.510 + (0.647 - 0.510) * tC,
      0.965 + (0.980 - 0.965) * tC
    );

    selectedMaterial.emissiveIntensity = 0.9 + (pulse * 1.4); // 0.9 → 2.3
  }

  // Animate hotspots when a hotspot-based exam view is active
  const activeHotspots = getActiveExamHotspots();
  if (activeHotspots.length > 0) {
    animateHotspots(activeHotspots);
  }

  renderer.render(scene, camera);
}

animate();

// ───────────── Load Anatomy Model (Async) ─────────────

async function initBody() {
  try {
    updateLoadingProgress(0);

    const result = await buildBody((pct) => {
      updateLoadingProgress(pct);
    }, APP_MODE, groupHeads);

    bodyGroup = result.bodyGroup;
    muscleMeshes = result.muscleMeshes;
    skeletonGroup = result.skeletonGroup;

    scene.add(bodyGroup);

    skeletonGroup.visible = true;

    const bodyBox = new THREE.Box3().setFromObject(bodyGroup);
    const bodyCenter = bodyBox.getCenter(new THREE.Vector3());
    const bodySize = bodyBox.getSize(new THREE.Vector3());

    const maxDim = Math.max(bodySize.x, bodySize.y, bodySize.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = (maxDim / 2) / Math.tan(fov / 2);
    cameraZ *= 1.3;

    const feetY = bodyBox.min.y - 0.5;
    gridHelper.position.y = feetY;
    ground.position.y = feetY;

    keyLight.shadow.camera.top = bodySize.y + 5;
    keyLight.shadow.camera.bottom = feetY;
    keyLight.shadow.camera.left = -bodySize.x;
    keyLight.shadow.camera.right = bodySize.x;
    keyLight.shadow.camera.far = maxDim * 3;
    keyLight.shadow.camera.updateProjectionMatrix();

    const viewTarget = new THREE.Vector3(bodyCenter.x, bodyCenter.y, bodyCenter.z);
    const viewPos = new THREE.Vector3(bodyCenter.x, bodyCenter.y, bodyCenter.z + cameraZ);

    defaultCameraPos = viewPos.clone();
    defaultLookAt = viewTarget.clone();

    animateCamera(viewPos, viewTarget, 1200);

    // ─── Post-load: Build rating and nerve maps ───

    ratingKeyToMeshes = new Map();
    for (const mesh of muscleMeshes) {
      const rk = mesh.userData.ratingKey;
      if (!rk) continue;
      if (!ratingKeyToMeshes.has(rk)) ratingKeyToMeshes.set(rk, []);
      ratingKeyToMeshes.get(rk).push(mesh);
    }
    uniqueRatingKeys = [...ratingKeyToMeshes.keys()].sort();

    nerveMeshMap = buildNerveMeshMap(muscleMeshes);

    ratingKeyToNerves = new Map();
    for (const rk of uniqueRatingKeys) {
      const meshes = ratingKeyToMeshes.get(rk) || [];
      const nerves = new Set();
      for (const m of meshes) {
        const rawName = (m.userData.muscleData?.rawName || '').toLowerCase();
        const mn = nerveMeshMap.get(rawName) || [];
        for (const nk of mn) nerves.add(nk);
      }
      if (nerves.size > 0) {
        ratingKeyToNerves.set(rk.toLowerCase(), [...nerves]);
      }
    }

    // Apply persisted ratings from localStorage
    loadFromStorage();
    for (const rk of uniqueRatingKeys) {
      const rating = getRating(rk);
      if (rating) {
        const mat = getRatingMaterial(rating.strength);
        const meshes = ratingKeyToMeshes.get(rk) || [];
        for (const m of meshes) {
          m.material = mat;
        }
      }
    }

    invalidateVisibleMeshes();

    console.log(`MyoAtlas: ${muscleMeshes.length} meshes, ${uniqueRatingKeys.length} unique muscles, ${nerveMeshMap.size} nerve-mapped`);

    rebuildFilters();
    rebuildMuscleList();
    updateUI();

    // Load reflex data from localStorage
    loadReflexesFromStorage();

    // Create reflex hotspots (only in examination mode)
    if (APP_MODE === 'examination') {
      const reflexResult = createReflexHotspots(scene);
      reflexHotspotsGroup = reflexResult.hotspotsGroup;
      reflexHotspots = reflexResult.reflexHotspots;

      const pyramidalResult = createPyramidalHotspots(scene);
      pyramidalHotspotsGroup = pyramidalResult.hotspotsGroup;
      pyramidalHotspots = pyramidalResult.pyramidalHotspots;

      reflexHotspotsGroup.visible = examView === 'reflex';
      pyramidalHotspotsGroup.visible = examView === 'pyramidal';
      updateMuscleVisibilityForExamView();
    }

    hideLoadingOverlay();
  } catch (error) {
    console.error('Failed to load anatomy model:', error);
    if (loadingText) {
      loadingText.textContent = 'Failed to load anatomy model.';
      loadingText.style.color = '#e74c3c';
    }
    const retryBtn = document.createElement('button');
    retryBtn.textContent = 'Retry';
    retryBtn.style.cssText = 'margin-top:12px;padding:8px 24px;font-size:14px;font-family:inherit;border:1px solid #0ea5e9;background:transparent;color:#0ea5e9;border-radius:4px;cursor:pointer;';
    retryBtn.addEventListener('click', () => {
      retryBtn.remove();
      if (loadingText) {
        loadingText.textContent = 'Loading anatomy model... 0%';
        loadingText.style.color = '';
      }
      initBody();
    });
    loadingText?.parentNode?.appendChild(retryBtn);
  }
}

// ───────────── Mode Selection ─────────────

function showModeSelection() {
  const modal = document.getElementById('mode-selection-modal');
  const btnExploration = document.getElementById('btn-exploration-mode');
  const btnExamination = document.getElementById('btn-examination-mode');

  // Check localStorage for remembered mode
  const rememberedMode = localStorage.getItem('myoatlas_app_mode');
  if (rememberedMode) {
    APP_MODE = rememberedMode;
    modal.classList.add('hidden');
    startApp();
    return;
  }

  // Show modal and wait for user choice
  btnExploration.addEventListener('click', () => {
    APP_MODE = 'exploration';
    localStorage.setItem('myoatlas_app_mode', 'exploration');
    modal.classList.add('hidden');
    startApp();
  });

  btnExamination.addEventListener('click', () => {
    APP_MODE = 'examination';
    localStorage.setItem('myoatlas_app_mode', 'examination');
    modal.classList.add('hidden');
    startApp();
  });
}

function startApp() {
  // Apply mode-specific UI
  applyModeUI();
  // Initialize 3D scene and body
  initBody();
  // Setup reflex UI handlers after DOM is ready
  setupReflexHandlers();
}

// ───────────── Reflex UI Event Handlers ─────────────

function isHotspotExamView() {
  return APP_MODE === 'examination' && (examView === 'reflex' || examView === 'pyramidal');
}

function updateExamViewUI() {
  document.querySelectorAll('.exam-view-btn[data-exam-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.examView === examView);
  });

  const helper = document.getElementById('exam-view-helper');
  if (helper) {
    const helperText = {
      muscle: 'Select muscles on the model to rate strength from 1 to 5.',
      reflex: 'Blue grouped markers appear at reflex test sites. Click a marker to grade the reflexes inside it.',
      pyramidal: 'Orange grouped markers appear at pyramidal sign test sites. Click a marker to mark signs present or absent.'
    };
    helper.textContent = helperText[examView];
    helper.style.display = APP_MODE === 'examination' ? 'block' : 'none';
  }

  const examMuscleVisibilityContainer = document.getElementById('exam-muscle-visibility-container');
  if (examMuscleVisibilityContainer) {
    examMuscleVisibilityContainer.style.display = isHotspotExamView() ? 'flex' : 'none';
  }

  const toggleExamMuscles = document.getElementById('toggle-exam-muscles');
  setPressedButton(toggleExamMuscles, !hideMusclesInReflexMode);
}

function setExamView(nextView) {
  if (!['muscle', 'reflex', 'pyramidal'].includes(nextView)) return;
  examView = nextView;
  localStorage.setItem('myoatlas_exam_view', examView);
  localStorage.setItem('myoatlas_reflex_mode_active', examView === 'reflex');

  if (reflexHotspotsGroup) reflexHotspotsGroup.visible = examView === 'reflex';
  if (pyramidalHotspotsGroup) pyramidalHotspotsGroup.visible = examView === 'pyramidal';

  hideReflexPanel();
  hideInfoPanel();
  if (selectedReflexHotspot) {
    selectedReflexHotspot.userData.isSelected = false;
    updateHotspotAppearance(selectedReflexHotspot);
  }
  selectedReflexHotspot = null;

  updateMuscleVisibilityForExamView();
  updateExamViewUI();
  applyExamSelectionFocus();
}

function updateMuscleVisibilityForExamView() {
  if (isHotspotExamView() && hideMusclesInReflexMode) {
    muscleMeshes.forEach(m => {
      m.visible = false;
    });
  } else {
    updateMuscleVisibility();
  }
  applyExamSelectionFocus();
  invalidateVisibleMeshes();
}

function setupReflexHandlers() {
  const toggleExamMuscles = document.getElementById('toggle-exam-muscles');

  document.querySelectorAll('.exam-view-btn[data-exam-view]').forEach(btn => {
    btn.addEventListener('click', () => setExamView(btn.dataset.examView));
  });

  if (toggleExamMuscles) {
    setPressedButton(toggleExamMuscles, !hideMusclesInReflexMode);

    toggleExamMuscles.addEventListener('click', () => {
      hideMusclesInReflexMode = isPressedButton(toggleExamMuscles);
      localStorage.setItem('myoatlas_exam_muscles_visible', (!hideMusclesInReflexMode).toString());
      setPressedButton(toggleExamMuscles, !hideMusclesInReflexMode);
      updateMuscleVisibilityForExamView();
    });
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.reflex-grade-btn, .mobile-grade-btn');
    if (!btn || !btn.dataset.reflexId) return;

    const { reflexId, side, grade } = btn.dataset;
    if (!reflexId || !side || !grade) return;

    setReflexTest(reflexId, side, grade);
    const host = btn.closest('#reflex-panel, #mobile-reflex-sheet');
    host?.querySelectorAll(`[data-reflex-id="${reflexId}"]`).forEach(item => {
      item.classList.toggle('active', item.dataset.grade === grade);
    });

    refreshExamHotspotAppearances();
  });

  document.addEventListener('change', (e) => {
    if (!e.target.matches('input[data-sign][data-side]')) return;

    const signId = e.target.dataset.sign;
    const side = e.target.dataset.side;
    if (!signId || !side) return;

    setPyramidalSign(signId, side, e.target.checked);
    refreshExamHotspotAppearances();
  });

  // Close reflex panel button
  const closeReflexBtn = document.getElementById('close-reflex-panel');
  if (closeReflexBtn) {
    closeReflexBtn.addEventListener('click', hideReflexPanel);
  }

  // Close mobile reflex sheet button
  const closeMobileReflexBtn = document.getElementById('close-mobile-reflex-sheet');
  if (closeMobileReflexBtn) {
    closeMobileReflexBtn.addEventListener('click', hideReflexPanel);
  }

  updateExamViewUI();
}

function applyModeUI() {
  const isExamination = APP_MODE === 'examination';

  // Hide/show rating controls based on mode
  const ratingSection = document.getElementById('rating-section');
  if (ratingSection) {
    ratingSection.classList.toggle('hidden', !isExamination);
  }

  const progressChip = document.getElementById('progress-chip');
  if (progressChip) {
    progressChip.classList.toggle('hidden', !isExamination);
  }

  const btnClearAll = document.getElementById('btn-clear-all');
  if (btnClearAll) {
    btnClearAll.classList.toggle('hidden', !isExamination);
  }

  // Mobile rating buttons
  const mobileRatingButtons = document.getElementById('mobile-rating-buttons');
  if (mobileRatingButtons && mobileRatingButtons.parentElement) {
    mobileRatingButtons.parentElement.classList.toggle('hidden', !isExamination);
  }

  // Update progress chip text if in exploration mode
  if (!isExamination && progressChip) {
    document.getElementById('progress-text').textContent = 'Exploration Mode';
  }

  // Show/hide examination view selector based on app mode
  const examViewSelector = document.getElementById('exam-view-selector');
  if (examViewSelector) {
    examViewSelector.classList.toggle('hidden', !isExamination);
  }

  updateExamViewUI();
}

// Start with mode selection
showModeSelection();
