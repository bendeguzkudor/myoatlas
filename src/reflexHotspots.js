/**
 * Exam Hotspots - 3D Marker System
 * Creates grouped interactive spheres for reflex and pyramidal sign exams.
 */

import * as THREE from 'three';
import {
  REFLEX_DEFINITIONS,
  REFLEX_HOTSPOT_GROUPS,
  PYRAMIDAL_SIGNS,
  PYRAMIDAL_HOTSPOT_GROUPS
} from './reflexData.js';
import {
  getReflexTest,
  getPyramidalSign,
} from './reflexSystem.js';

const REFLEX_GRADE_COLORS = {
  areflexia: '#7F1D1D',
  hyporeflexia: '#F97316',
  normal: '#10B981',
  hyperreflexia: '#EF4444'
};

const REFLEX_GRADE_BASES = {
  areflexia: '#120707',
  hyporeflexia: '#1d1007',
  normal: '#061510',
  hyperreflexia: '#170707'
};

function createLabelSprite(label, side) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 128;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.shadowColor = 'rgba(0, 0, 0, 0.8)';
  context.shadowBlur = 8;
  context.shadowOffsetX = 2;
  context.shadowOffsetY = 2;
  context.fillStyle = '#FFFFFF';
  context.font = 'bold 48px Inter, Arial, sans-serif';
  context.textAlign = 'left';
  context.textBaseline = 'middle';
  context.fillText(label, 20, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.95
  }));
  sprite.scale.set(4, 1, 1);
  sprite.position.set(side === 'left' ? -2.5 : 2.5, 0, 0);
  sprite.renderOrder = 11;
  return sprite;
}

function makeMarker(groupDef, side, type, material) {
  const pos = groupDef.positions[side];
  const markerGroup = new THREE.Group();
  markerGroup.position.set(pos.x, pos.y, pos.z);

  const hotspot = new THREE.Mesh(
    new THREE.SphereGeometry(0.58, 24, 24),
    material.clone()
  );
  hotspot.renderOrder = 10;
  hotspot.material.color.set(groupDef.color || '#60A5FA');
  hotspot.material.emissive.set(groupDef.color || '#60A5FA');
  hotspot.material.emissiveIntensity = 0.9;

  markerGroup.add(hotspot);
  markerGroup.add(createLabelSprite(groupDef.label, side));

  hotspot.userData = {
    type,
    hotspotId: groupDef.id,
    side,
    definition: groupDef,
    markerGroup,
    isSelected: false,
    emissiveIntensity: material.emissiveIntensity || 0.9,
    originalMaterial: hotspot.material
  };

  return { markerGroup, hotspot };
}

function isReflexGroupComplete(groupDef, side) {
  return groupDef.reflexIds.every(reflexId => getReflexTest(reflexId, side));
}

function isPyramidalGroupComplete(groupDef, side) {
  return groupDef.signIds.every(signId => getPyramidalSign(signId, side));
}

export function createReflexHotspots(scene) {
  const hotspotsGroup = new THREE.Group();
  hotspotsGroup.name = 'reflexHotspots';
  hotspotsGroup.visible = false;
  const reflexHotspots = [];

  for (const groupDef of Object.values(REFLEX_HOTSPOT_GROUPS)) {
    ['left', 'right'].forEach(side => {
      const { markerGroup, hotspot } = makeMarker(
        groupDef,
        side,
        'reflexHotspot',
        createHotspotMaterial(groupDef.color || '#3B82F6')
      );
      hotspotsGroup.add(markerGroup);
      reflexHotspots.push(hotspot);
      updateHotspotAppearance(hotspot);
    });
  }

  scene.add(hotspotsGroup);
  console.log(`Created ${reflexHotspots.length} grouped reflex hotspots`);
  return { hotspotsGroup, reflexHotspots };
}

export function createPyramidalHotspots(scene) {
  const hotspotsGroup = new THREE.Group();
  hotspotsGroup.name = 'pyramidalHotspots';
  hotspotsGroup.visible = false;
  const pyramidalHotspots = [];

  for (const groupDef of Object.values(PYRAMIDAL_HOTSPOT_GROUPS)) {
    ['left', 'right'].forEach(side => {
      const { markerGroup, hotspot } = makeMarker(
        groupDef,
        side,
        'pyramidalHotspot',
        createHotspotMaterial(groupDef.color || '#F97316')
      );
      hotspotsGroup.add(markerGroup);
      pyramidalHotspots.push(hotspot);
      updateHotspotAppearance(hotspot);
    });
  }

  scene.add(hotspotsGroup);
  console.log(`Created ${pyramidalHotspots.length} pyramidal hotspots`);
  return { hotspotsGroup, pyramidalHotspots };
}

export function getReflexDefinitionsForHotspot(hotspotData) {
  return (hotspotData.definition.reflexIds || [])
    .map(reflexId => REFLEX_DEFINITIONS[reflexId])
    .filter(Boolean);
}

export function getPyramidalSignsForHotspot(hotspotData) {
  return (hotspotData.definition.signIds || [])
    .map(signId => PYRAMIDAL_SIGNS[signId])
    .filter(Boolean);
}

/**
 * Update hotspot appearance based on completion status.
 * @param {THREE.Mesh} hotspot
 */
export function updateHotspotAppearance(hotspot) {
  const { type, side, definition, isSelected } = hotspot.userData;
  const state = type === 'pyramidalHotspot'
    ? getPyramidalHotspotState(definition, side)
    : getReflexHotspotState(definition, side);

  hotspot.material = createHotspotMaterial(state.color, state.emissiveIntensity, state.emissiveColor);
  hotspot.scale.setScalar(isSelected ? 1.22 : 1.0);
  hotspot.material.opacity = isSelected ? 1 : 0.95;
  hotspot.material.depthWrite = !isSelected;
  hotspot.material.emissiveIntensity = isSelected
    ? Math.max(state.emissiveIntensity + 0.35, 1.45)
    : state.emissiveIntensity;
  hotspot.userData.emissiveIntensity = hotspot.material.emissiveIntensity;
  hotspot.userData.originalMaterial = hotspot.material;
}

/**
 * Animate hotspots with pulsing glow effect.
 * @param {Array<THREE.Mesh>} hotspots
 */
export function animateHotspots(hotspots) {
  hotspots.forEach(hotspot => {
    if (!hotspot.visible) return;
    const target = hotspot.userData.isSelected ? 1.55 : (hotspot.userData.emissiveIntensity || 0.9);
    hotspot.material.emissiveIntensity = Math.min(target, 1.6);
  });
}

function getReflexHotspotState(definition, side) {
  const tests = (definition.reflexIds || [])
    .map(reflexId => getReflexTest(reflexId, side)?.value)
    .filter(Boolean);

  if (tests.length === 0) {
    return {
      color: REFLEX_GRADE_BASES.normal,
      emissiveColor: '#3B82F6',
      emissiveIntensity: 0.95
    };
  }

  const first = tests[0];
  const same = tests.every(value => value === first);
  if (same) {
    return {
      color: REFLEX_GRADE_BASES[first] || REFLEX_GRADE_BASES.normal,
      emissiveColor: REFLEX_GRADE_COLORS[first] || '#3B82F6',
      emissiveIntensity: 1.15
    };
  }

  return {
    color: '#2b1d07',
    emissiveColor: '#F59E0B',
    emissiveIntensity: 1.0
  };
}

function getPyramidalHotspotState(definition, side) {
  const signs = (definition.signIds || [])
    .map(signId => getPyramidalSign(signId, side))
    .filter(Boolean);

  if (signs.length === 0) {
    return {
      color: '#1d1007',
      emissiveColor: definition.color || '#F97316',
      emissiveIntensity: 0.95
    };
  }

  const positiveCount = signs.filter(sign => sign.isPresent).length;
  if (positiveCount === 0) {
    return {
      color: '#1d1007',
      emissiveColor: '#F97316',
      emissiveIntensity: 1.0
    };
  }

  return {
    color: positiveCount === signs.length ? '#170707' : '#2b1d07',
    emissiveColor: positiveCount === signs.length ? '#EF4444' : '#F59E0B',
    emissiveIntensity: 1.15
  };
}

function createHotspotMaterial(color, emissiveIntensity = 0.9, emissiveColor = null) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.1,
    metalness: 0.35,
    emissive: new THREE.Color(emissiveColor || color),
    emissiveIntensity,
    transparent: true,
    opacity: 0.95
  });
}
