/**
 * Rating system for muscle strength assessment.
 * Manages 5-level strength ratings with color-coded materials.
 * Persists ratings to localStorage.
 */

import * as THREE from 'three';

// ───────────── Strength Level Definitions ─────────────

export const STRENGTH_LEVELS = {
  1: { label: 'Very Weak', color: '#EF4444', shortLabel: '1' },
  2: { label: 'Weak', color: '#F97316', shortLabel: '2' },
  3: { label: 'Moderate', color: '#F59E0B', shortLabel: '3' },
  4: { label: 'Strong', color: '#84CC16', shortLabel: '4' },
  5: { label: 'Very Strong', color: '#10B981', shortLabel: '5' },
};

// ───────────── Rating Materials (5 shared instances) ─────────────

export const ratingMaterials = {};
for (const [level, def] of Object.entries(STRENGTH_LEVELS)) {
  ratingMaterials[level] = new THREE.MeshStandardMaterial({
    color: new THREE.Color(def.color),
    roughness: 0.45,
    metalness: 0.0,
    emissive: new THREE.Color(def.color).multiplyScalar(0.12),
    side: THREE.DoubleSide,
    flatShading: false,
  });
}

// ───────────── localStorage Persistence ─────────────

const STORAGE_KEY = 'myoatlas_ratings';

function saveToStorage() {
  try {
    const data = {};
    for (const [key, val] of ratings) {
      data[key] = val;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {
    // localStorage may be unavailable or full — silently ignore
  }
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return;
    for (const [key, val] of Object.entries(data)) {
      if (val && typeof val.strength === 'number' && val.strength >= 1 && val.strength <= 5) {
        ratings.set(key, { strength: val.strength });
      }
    }
  } catch (_) {
    // Corrupted data — silently ignore
  }
}

// ───────────── Rating State ─────────────

// Map of ratingKey → { strength: 1-5 }
const ratings = new Map();

/**
 * Set a rating for a muscle (identified by ratingKey).
 * @param {string} ratingKey - Canonical muscle name
 * @param {number} strength - 1-5
 */
export function setRating(ratingKey, strength) {
  if (strength < 1 || strength > 5) return;
  ratings.set(ratingKey, { strength });
  saveToStorage();
}

/**
 * Get the rating for a muscle.
 * @param {string} ratingKey
 * @returns {{ strength: number } | null}
 */
export function getRating(ratingKey) {
  return ratings.get(ratingKey) || null;
}

/**
 * Get all ratings as a plain object { ratingKey: { strength } }.
 */
export function getAllRatings() {
  const result = {};
  for (const [key, val] of ratings) {
    result[key] = { ...val };
  }
  return result;
}

/**
 * Clear all ratings.
 */
export function clearAllRatings() {
  ratings.clear();
  saveToStorage();
}

/**
 * Get statistics about current ratings.
 * @returns {{ total: number, rated: number, average: number, distribution: Record<number, number> }}
 */
export function getRatingStats(totalMuscles) {
  const rated = ratings.size;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  for (const { strength } of ratings.values()) {
    distribution[strength]++;
    sum += strength;
  }

  return {
    total: totalMuscles || 0,
    rated,
    average: rated > 0 ? (sum / rated) : 0,
    distribution,
  };
}

/**
 * Get the rating material for a given strength level.
 * @param {number} strength - 1-5
 * @returns {THREE.MeshStandardMaterial}
 */
export function getRatingMaterial(strength) {
  return ratingMaterials[strength] || null;
}
