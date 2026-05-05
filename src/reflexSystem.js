/**
 * Reflex System - State Management & Persistence
 * Handles reflex test data storage, retrieval, and 3D materials
 */

import * as THREE from 'three';
import { REFLEX_GRADES, REFLEX_DEFINITIONS, PYRAMIDAL_SIGNS } from './reflexData.js';

// State storage
const reflexTests = new Map(); // key: "patellar_left" -> { reflexId, side, value, timestamp }
const pyramidalSigns = new Map(); // key: "babinski_left" -> { signId, side, isPresent, timestamp }

// localStorage persistence
const STORAGE_KEY = 'myoatlas_reflexes';

/**
 * Load reflex data from localStorage
 */
export function loadReflexesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const data = JSON.parse(raw);

    // Load reflex tests
    for (const [key, val] of Object.entries(data.reflexTests || {})) {
      reflexTests.set(key, val);
    }

    // Load pyramidal signs
    for (const [key, val] of Object.entries(data.pyramidalSigns || {})) {
      pyramidalSigns.set(key, val);
    }

    console.log(`Loaded ${reflexTests.size} reflex tests and ${pyramidalSigns.size} pyramidal signs from storage`);
  } catch (err) {
    console.warn('Failed to load reflex data from storage:', err);
  }
}

/**
 * Save current state to localStorage
 */
function saveToStorage() {
  const data = {
    reflexTests: Object.fromEntries(reflexTests),
    pyramidalSigns: Object.fromEntries(pyramidalSigns),
    version: 1
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Set reflex test result
 * @param {string} reflexId - e.g., "patellar"
 * @param {string} side - "left" or "right"
 * @param {string} value - "areflexia" | "hyporeflexia" | "normal" | "hyperreflexia"
 */
export function setReflexTest(reflexId, side, value) {
  const key = `${reflexId}_${side}`;
  reflexTests.set(key, {
    reflexId,
    side,
    value,
    timestamp: Date.now()
  });
  saveToStorage();
}

/**
 * Get reflex test result
 * @param {string} reflexId
 * @param {string} side
 * @returns {object|null}
 */
export function getReflexTest(reflexId, side) {
  return reflexTests.get(`${reflexId}_${side}`) || null;
}

/**
 * Set pyramidal sign assessment
 * @param {string} signId - e.g., "babinski"
 * @param {string} side - "left" or "right"
 * @param {boolean} isPresent
 */
export function setPyramidalSign(signId, side, isPresent) {
  const key = `${signId}_${side}`;
  pyramidalSigns.set(key, {
    signId,
    side,
    isPresent,
    timestamp: Date.now()
  });
  saveToStorage();
}

/**
 * Get pyramidal sign assessment
 * @param {string} signId
 * @param {string} side
 * @returns {object|null}
 */
export function getPyramidalSign(signId, side) {
  return pyramidalSigns.get(`${signId}_${side}`) || null;
}

/**
 * Clear all reflex data
 */
export function clearAllReflexData() {
  reflexTests.clear();
  pyramidalSigns.clear();
  saveToStorage();
}

/**
 * Export reflex data for PDF/JSON
 */
export function exportReflexData() {
  return {
    reflexTests: Object.fromEntries(reflexTests),
    pyramidalSigns: Object.fromEntries(pyramidalSigns),
    exportDate: new Date().toISOString()
  };
}

/**
 * Get statistics about reflex testing completion
 */
export function getReflexStats() {
  const totalTests = Object.keys(REFLEX_DEFINITIONS).length * 2; // bilateral
  const completedTests = reflexTests.size;
  const completedSigns = pyramidalSigns.size;

  return {
    totalTests,
    completedTests,
    completedSigns,
    percentComplete: totalTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0
  };
}

// Material for untested reflex hotspots - MUCH brighter
export const reflexHotspotMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0.4, 0.65, 1.0), // Bright blue
  roughness: 0.1,
  metalness: 0.5,
  emissive: new THREE.Color(0.231, 0.510, 0.965),
  emissiveIntensity: 1.5, // Much brighter
  transparent: true,
  opacity: 0.95
});

// Material for tested reflex hotspots - bright green
export const reflexTestedMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0.2, 0.9, 0.6), // Bright green
  roughness: 0.1,
  metalness: 0.5,
  emissive: new THREE.Color(0.062, 0.725, 0.505),
  emissiveIntensity: 1.2,
  transparent: true,
  opacity: 0.95
});
