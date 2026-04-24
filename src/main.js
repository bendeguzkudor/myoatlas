import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildBody, highlightMaterial, selectedMaterial, boneMaterial, groupMaterials, deriveRatingKey } from './bodyBuilder.js';
import { MUSCLE_GROUPS } from './muscleData.js';
import { NERVE_GROUPS, buildNerveMeshMap } from './nerveData.js';
import { STRENGTH_LEVELS, ratingMaterials, setRating, getRating, getAllRatings, clearAllRatings, getRatingStats, getRatingMaterial, loadFromStorage } from './ratingSystem.js';
import { exportJSON, exportPDF } from './exportService.js';
import { isPriorityMuscle, getPriorityInfo } from './priorityMuscles.js';

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
let priorityFilter = 'all';

// Display mode: 'full' or 'priority-only'
let displayMode = localStorage.getItem('displayMode') || 'full';

// Group heads setting: whether to group muscle heads/parts for rating
let groupHeads = localStorage.getItem('groupHeads') !== 'false'; // default true

// ───────────── Raycasting & Interaction ─────────────

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredMesh = null;
let selectedMesh = null;

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

function onMouseMove(event) {
  if (muscleMeshes.length === 0) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(getVisibleMeshes(), false);

  if (hoveredMesh && hoveredMesh !== selectedMesh) {
    resetMeshAppearance(hoveredMesh);
  }

  if (intersects.length > 0) {
    const mesh = intersects[0].object;
    if (mesh !== selectedMesh) {
      hoveredMesh = mesh;
      mesh.material = highlightMaterial;
    }
    canvas.style.cursor = 'pointer';
  } else {
    hoveredMesh = null;
    canvas.style.cursor = 'default';
  }
}

function onClick(event) {
  if (muscleMeshes.length === 0) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(getVisibleMeshes(), false);

  if (selectedMesh) {
    resetMeshAppearance(selectedMesh);
    selectedMesh = null;
  }

  if (intersects.length > 0) {
    const mesh = intersects[0].object;
    selectedMesh = mesh;
    mesh.material = selectedMaterial;
    showInfoPanel(mesh.userData);

    // Zoom to the selected muscle
    zoomToMesh(mesh);
  } else {
    hideInfoPanel();
  }
}

function resetMeshAppearance(mesh) {
  // Priority: rated > original
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
  const ratingKey = mesh.userData.ratingKey;
  if (!ratingKey) return;

  setRating(ratingKey, strength);

  // Apply rating material to ALL meshes sharing this ratingKey
  const meshes = ratingKeyToMeshes.get(ratingKey) || [];
  const mat = getRatingMaterial(strength);
  for (const m of meshes) {
    m.material = mat; // Apply to all meshes including selected
  }

  updateUI();

  // Clear selection highlight so user can see the new color
  if (selectedMesh) {
    selectedMesh = null;
  }

  // Hide info panel/sheet
  hideInfoPanel();

  // Return to front view after rating for better workflow
  setTimeout(() => {
    const dist = defaultCameraPos.distanceTo(defaultLookAt);
    animateCamera(
      new THREE.Vector3(defaultLookAt.x, defaultLookAt.y, defaultLookAt.z + dist),
      defaultLookAt.clone(), 800
    );
  }, 300); // Small delay so user sees the rating applied
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
});

function showInfoPanel(userData) {
  if (isMobile()) {
    showMobileSheet(userData);
  } else {
    showDesktopInfoPanel(userData);
  }
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
        mesh.material = selectedMaterial;
        showInfoPanel(mesh.userData);
        searchInput.value = '';
        searchResults.innerHTML = '';
        selectedResultIndex = -1;
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

function zoomToMesh(mesh) {
  mesh.geometry.computeBoundingBox();
  const box = mesh.geometry.boundingBox;
  const center = new THREE.Vector3();
  box.getCenter(center);
  mesh.localToWorld(center);

  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const zoomDist = Math.max(maxDim * 3, 8);

  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  const targetPos = center.clone().sub(dir.multiplyScalar(zoomDist));

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

// Mode toggle buttons
const btnFullMode = document.getElementById('btn-full-mode');
const btnPriorityMode = document.getElementById('btn-priority-mode');
const modeDescription = document.getElementById('mode-description');
const priorityFilterSection = document.getElementById('priority-filter-section');

// Initialize mode UI
if (displayMode === 'priority-only') {
  btnFullMode.classList.remove('active');
  btnPriorityMode.classList.add('active');
  modeDescription.textContent = 'Priority Only: Showing ~45 key muscles for clinical assessment.';
  if (priorityFilterSection) priorityFilterSection.style.display = 'none';
} else {
  btnFullMode.classList.add('active');
  btnPriorityMode.classList.remove('active');
  modeDescription.textContent = 'Full Model: All 467 muscles loaded. Use filters below to focus on priorities.';
  if (priorityFilterSection) priorityFilterSection.style.display = 'block';
}

btnFullMode.addEventListener('click', () => {
  if (displayMode === 'full') return;
  localStorage.setItem('displayMode', 'full');
  location.reload();
});

btnPriorityMode.addEventListener('click', () => {
  if (displayMode === 'priority-only') return;
  localStorage.setItem('displayMode', 'priority-only');
  location.reload();
});

// Priority filter buttons (only active in full mode)
const btnAllMuscles = document.getElementById('btn-all-muscles');
const btnPriorityOnly = document.getElementById('btn-priority-only');

if (btnAllMuscles) {
  btnAllMuscles.addEventListener('click', () => {
    if (priorityFilter === 'all') return;
    priorityFilter = 'all';
    btnAllMuscles.classList.add('active');
    btnPriorityOnly.classList.remove('active');
    rebuildMuscleList();
  });
}

if (btnPriorityOnly) {
  btnPriorityOnly.addEventListener('click', () => {
    if (priorityFilter === 'priority') return;
    priorityFilter = 'priority';
    btnPriorityOnly.classList.add('active');
    btnAllMuscles.classList.remove('active');
    rebuildMuscleList();
  });
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
  for (const mesh of muscleMeshes) {
    if (hiddenMeshes.has(mesh)) {
      mesh.visible = false;
      continue;
    }

    const isTendon = mesh.userData.muscleData.type === 'tendon';
    const tendonVisible = document.getElementById('toggle-tendons').checked;

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

function rebuildMuscleList() {
  muscleListContainer.innerHTML = '';

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

      if (selectedMesh) resetMeshAppearance(selectedMesh);
      selectedMesh = mesh;
      mesh.material = selectedMaterial;
      showInfoPanel(mesh.userData);
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
    item.classList.toggle('selected', item.dataset.ratingKey === rk);
  });
}

function updateMuscleListRatings() {
  document.querySelectorAll('.muscle-list-item').forEach(item => {
    const rk = item.dataset.ratingKey;
    const rating = getRating(rk);

    // Update data-rating attribute for CSS styling
    if (rating) {
      item.setAttribute('data-rating', rating.strength);
    } else {
      item.removeAttribute('data-rating');
    }
  });
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

  document.getElementById('muscle-opacity-slider').value = 1;
  setMuscleOpacity(1);
  document.getElementById('skeleton-opacity-slider').value = 0.6;
  setSkeletonOpacity(0.6);
  hiddenMeshes.clear();
  updateHiddenUI();
  if (selectedMesh) {
    resetMeshAppearance(selectedMesh);
    selectedMesh = null;
  }
  hideInfoPanel();
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

// Toggle skeleton
document.getElementById('toggle-skeleton').addEventListener('change', (e) => {
  if (skeletonGroup) skeletonGroup.visible = e.target.checked;
});

// Toggle tendons
document.getElementById('toggle-tendons').addEventListener('change', () => {
  updateMuscleVisibility();
});

// Toggle group heads - regenerate rating keys on the fly
const toggleGroupHeads = document.getElementById('toggle-group-heads');
if (toggleGroupHeads) {
  // Set initial state from localStorage
  toggleGroupHeads.checked = groupHeads;

  toggleGroupHeads.addEventListener('change', (e) => {
    groupHeads = e.target.checked;
    localStorage.setItem('groupHeads', groupHeads.toString());

    // Regenerate rating keys for all meshes
    muscleMeshes.forEach(mesh => {
      const rawName = mesh.userData.muscleData.rawName;
      mesh.userData.ratingKey = deriveRatingKey(rawName, groupHeads);
    });

    // Rebuild the deduplication maps
    ratingKeyToMeshes.clear();
    uniqueRatingKeys = [];
    const seenKeys = new Set();

    for (const mesh of muscleMeshes) {
      const rk = mesh.userData.ratingKey;
      if (!ratingKeyToMeshes.has(rk)) {
        ratingKeyToMeshes.set(rk, []);
      }
      ratingKeyToMeshes.get(rk).push(mesh);
      if (!seenKeys.has(rk)) {
        uniqueRatingKeys.push(rk);
        seenKeys.add(rk);
      }
    }

    // Rebuild UI
    rebuildMuscleList();
    updateProgressChip();

    // If a muscle is selected, refresh the info panel
    if (selectedMesh) {
      showInfoPanel(selectedMesh.userData);
    }
  });
}

// Muscle opacity slider
document.getElementById('muscle-opacity-slider').addEventListener('input', (e) => {
  setMuscleOpacity(parseFloat(e.target.value));
});

// Skeleton opacity slider
document.getElementById('skeleton-opacity-slider').addEventListener('input', (e) => {
  setSkeletonOpacity(parseFloat(e.target.value));
});

function setMuscleOpacity(opacity) {
  const seen = new Set();
  for (const mesh of muscleMeshes) {
    const mat = mesh.userData.originalMaterial;
    if (mat && !seen.has(mat)) {
      seen.add(mat);
      mat.opacity = opacity;
      mat.transparent = opacity < 1;
      mat.depthWrite = opacity >= 1;
    }
  }
  highlightMaterial.opacity = opacity;
  highlightMaterial.transparent = opacity < 1;
  highlightMaterial.depthWrite = opacity >= 1;
  selectedMaterial.opacity = opacity;
  selectedMaterial.transparent = opacity < 1;
  selectedMaterial.depthWrite = opacity >= 1;
  // Update rating materials
  for (const mat of Object.values(ratingMaterials)) {
    mat.opacity = opacity;
    mat.transparent = opacity < 1;
    mat.depthWrite = opacity >= 1;
  }
}

function setSkeletonOpacity(opacity) {
  boneMaterial.opacity = opacity;
  boneMaterial.transparent = opacity < 1;
  boneMaterial.depthWrite = opacity >= 1;
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
  if (ratedCount === 0) return;

  showConfirmModal(
    'Clear All Ratings',
    `Are you sure you want to clear all ${ratedCount} ratings? This cannot be undone.`,
    () => {
      clearAllRatings();
      for (const mesh of muscleMeshes) {
        if (mesh !== selectedMesh) {
          mesh.material = mesh.userData.originalMaterial;
        }
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
    if (selectedMesh) {
      resetMeshAppearance(selectedMesh);
      selectedMesh = null;
      hideInfoPanel();
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

  // Adjust mobile sheet max-height in landscape
  if (isMobile() && mobileSheet) {
    const isLandscape = window.innerWidth > window.innerHeight;
    mobileSheet.style.maxHeight = isLandscape ? '60vh' : '80vh';
    const sheetContent = mobileSheet.querySelector('.sheet-content');
    if (sheetContent) {
      sheetContent.style.maxHeight = isLandscape ? 'calc(60vh - 32px)' : 'calc(80vh - 32px)';
    }
  }
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

  // Pulsing effect on selected material for MAXIMUM visibility
  if (selectedMesh && selectedMesh.material === selectedMaterial) {
    const time = Date.now() * 0.004; // Faster pulse for more noticeable effect
    const pulse = Math.sin(time) * 0.5 + 0.5; // 0 to 1

    // VERY dramatic emissive glow - pulse from dim to super bright
    const minEmissive = 0.3;
    const maxEmissive = 1.5; // Go beyond 1.0 for extra brightness
    const pulseEmissive = minEmissive + (pulse * (maxEmissive - minEmissive));
    selectedMaterial.emissive.setRGB(
      pulseEmissive * 0.4,  // Cyan/blue glow
      pulseEmissive * 0.8,
      pulseEmissive * 1.0
    );

    // Strong color pulse too
    const minColor = 0.5;
    const maxColor = 1.0;
    const pulseColor = minColor + (pulse * (maxColor - minColor));
    selectedMaterial.color.setRGB(
      pulseColor * 0.7,
      pulseColor * 0.92,
      pulseColor * 1.0
    );

    // Increase emissive intensity for extra glow
    selectedMaterial.emissiveIntensity = 1.0 + (pulse * 2.0); // 1.0 to 3.0
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
    }, displayMode, groupHeads);

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

initBody();
