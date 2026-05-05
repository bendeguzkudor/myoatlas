/**
 * Reflex Hotspots - 3D Marker System
 * Creates interactive spheres at reflex test sites
 */

import * as THREE from 'three';
import { REFLEX_DEFINITIONS } from './reflexData.js';
import { getReflexTest, reflexHotspotMaterial, reflexTestedMaterial } from './reflexSystem.js';

/**
 * Create reflex hotspot markers for all defined reflexes
 * @param {THREE.Scene} scene - Three.js scene
 * @returns {object} - { hotspotsGroup, reflexHotspots }
 */
export function createReflexHotspots(scene) {
  const hotspotsGroup = new THREE.Group();
  hotspotsGroup.name = 'reflexHotspots';
  hotspotsGroup.visible = false; // Hidden until reflex mode enabled

  const reflexHotspots = [];

  // Create hotspots for each reflex (bilateral)
  for (const [reflexId, reflexDef] of Object.entries(REFLEX_DEFINITIONS)) {
    ['left', 'right'].forEach(side => {
      const pos = reflexDef.positions[side];

      // Create a group for the hotspot marker (sphere + outer ring)
      const markerGroup = new THREE.Group();
      markerGroup.position.set(pos.x, pos.y, pos.z);

      // Main sphere - use custom color if defined, otherwise default blue
      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      let material;

      if (reflexDef.color) {
        // Custom color for this reflex type
        const customColor = new THREE.Color(reflexDef.color);
        material = new THREE.MeshStandardMaterial({
          color: customColor,
          roughness: 0.1,
          metalness: 0.5,
          emissive: customColor,
          emissiveIntensity: 1.5,
          transparent: true,
          opacity: 0.95
        });
      } else {
        // Default blue
        material = reflexHotspotMaterial.clone();
      }

      const hotspot = new THREE.Mesh(geometry, material);
      hotspot.renderOrder = 10;

      // Add outer glow ring with matching color
      const ringGeometry = new THREE.RingGeometry(0.6, 0.8, 32);
      const ringColor = reflexDef.color ? new THREE.Color(reflexDef.color) : new THREE.Color(0.231, 0.510, 0.965);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: ringColor,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2; // Make ring horizontal

      markerGroup.add(hotspot);
      markerGroup.add(ring);

      // Add text label for all reflexes, positioned on outer side (away from body center)
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 128;

      // Clear background (transparent)
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw text with shadow for better visibility
      context.shadowColor = 'rgba(0, 0, 0, 0.8)';
      context.shadowBlur = 8;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;

      context.fillStyle = '#FFFFFF';
      context.font = 'bold 48px Inter, Arial, sans-serif';
      context.textAlign = 'left';
      context.textBaseline = 'middle';
      context.fillText(reflexDef.label, 20, canvas.height / 2);

      // Create sprite
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(4, 1, 1);

      // Position label on outer side (away from body center)
      // If left side (negative x), place label further left
      // If right side (positive x), place label further right
      const labelOffsetX = side === 'left' ? -2.5 : 2.5;
      sprite.position.set(labelOffsetX, 0, 0);
      sprite.renderOrder = 11;

      markerGroup.add(sprite);
      hotspot.userData.labelSprite = sprite;

      // Store data on the main sphere mesh
      hotspot.userData = {
        type: 'reflexHotspot',
        reflexId: reflexId,
        side: side,
        definition: reflexDef,
        markerGroup: markerGroup, // Reference to parent group
        ring: ring, // Reference to ring for animation
        originalMaterial: material // Store original material for hover/selection restoration
      };

      // Check if this reflex has been tested
      const test = getReflexTest(reflexId, side);
      if (test) {
        hotspot.material = reflexTestedMaterial.clone();
        ring.material.color.set(0.062, 0.725, 0.505); // Green ring
      }

      hotspotsGroup.add(markerGroup);
      reflexHotspots.push(hotspot); // Add sphere to array for raycasting
    });
  }

  scene.add(hotspotsGroup);

  console.log(`Created ${reflexHotspots.length} reflex hotspots`);

  return { hotspotsGroup, reflexHotspots };
}

/**
 * Update hotspot appearance based on test status
 * @param {THREE.Mesh} hotspot
 */
export function updateHotspotAppearance(hotspot) {
  const { reflexId, side } = hotspot.userData;
  const test = getReflexTest(reflexId, side);

  if (test) {
    // Tested - use green material
    hotspot.material = reflexTestedMaterial.clone();
  } else {
    // Untested - use blue material
    hotspot.material = reflexHotspotMaterial.clone();
  }
}

/**
 * Animate hotspots with pulsing glow effect
 * Call this in the render loop
 * @param {Array<THREE.Mesh>} reflexHotspots
 */
export function animateHotspots(reflexHotspots) {
  const time = Date.now() * 0.001; // Convert to seconds

  reflexHotspots.forEach(hotspot => {
    if (!hotspot.visible) return;

    // Dramatic pulsing animation: cycle emissiveIntensity
    const intensity = 1.0 + Math.sin(time * 2.5) * 0.8; // 0.2 to 1.8
    hotspot.material.emissiveIntensity = intensity;

    // Scale pulse for emphasis - more pronounced
    const scale = 1.0 + Math.sin(time * 2.5) * 0.15; // 0.85 to 1.15
    hotspot.scale.set(scale, scale, scale);

    // Animate the ring if it exists
    const ring = hotspot.userData.ring;
    if (ring) {
      // Ring opacity pulse
      ring.material.opacity = 0.3 + Math.sin(time * 2.5) * 0.25; // 0.05 to 0.55

      // Ring scale pulse (opposite phase for visual interest)
      const ringScale = 1.0 + Math.sin(time * 2.5 + Math.PI) * 0.1;
      ring.scale.set(ringScale, ringScale, 1);
    }
  });
}
