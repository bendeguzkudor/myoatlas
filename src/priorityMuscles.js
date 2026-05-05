/**
 * Priority muscles from neuromodell.docx
 * Organized by nerve groups for clinical neuromodulation
 */

export const PRIORITY_MUSCLES = {
  // Upper Limb - Accessory Nerve
  'TRAPEZIUS': { nerve: 'Accessory', abbr: null, side: 'both' },

  // Upper Limb - Plexus Brachialis
  'RHOMBOIDEUS': { nerve: 'Dorsal scapular', abbr: null, side: 'both', note: 'C4, C5' },
  'RHOMBOID MAJOR': { nerve: 'Dorsal scapular', abbr: null, side: 'both', note: 'C4, C5' },
  'RHOMBOID MINOR': { nerve: 'Dorsal scapular', abbr: null, side: 'both', note: 'C4, C5' },
  'SERRATUS ANTERIOR': { nerve: 'Long thoracic', abbr: null, side: 'both', note: 'C5, C6, C7' },
  'PECTORALIS MAJOR': { nerve: 'Pectoral', abbr: null, side: 'both', note: 'Clavicular C5,C6 / Sternocostal C6,C7,C8' },
  'SUPRASPINATUS': { nerve: 'Suprascapular', abbr: null, side: 'both', note: 'C5, C6' },
  'INFRASPINATUS': { nerve: 'Suprascapular', abbr: null, side: 'both', note: 'C5, C6' },
  'LATISSIMUS DORSI': { nerve: 'Thoracodorsal', abbr: null, side: 'both', note: 'C6, C7, C8' },
  'TERES MAJOR': { nerve: 'Lower subscapular', abbr: null, side: 'both', note: 'C5, C6, C7' },

  // Upper Limb - Musculocutaneous Nerve
  'BICEPS BRACHII': { nerve: 'Musculocutaneous', abbr: null, side: 'both', note: 'C5, C6' },

  // Upper Limb - Axillary Nerve
  'DELTOIDEUS': { nerve: 'Axillary', abbr: null, side: 'both', note: 'C5, C6' },
  'DELTOID': { nerve: 'Axillary', abbr: null, side: 'both', note: 'C5, C6' },

  // Upper Limb - Radial Nerve
  'TRICEPS': { nerve: 'Radial', abbr: null, side: 'both', note: 'C6, C7, C8' },
  'BRACHIORADIALIS': { nerve: 'Radial', abbr: 'BR', side: 'both' },
  'EXTENSOR CARPI RADIALIS LONGUS': { nerve: 'Radial', abbr: 'ECRL', side: 'both' },
  'SUPINATOR': { nerve: 'Radial', abbr: null, side: 'both' },
  'EXTENSOR CARPI ULNARIS': { nerve: 'Posterior interosseous', abbr: 'ECU', side: 'both' },
  'EXTENSOR DIGITORUM': { nerve: 'Posterior interosseous', abbr: 'ED', side: 'both' },
  'ABDUCTOR POLLICIS LONGUS': { nerve: 'Posterior interosseous', abbr: 'APL', side: 'both' },
  'EXTENSOR POLLICIS LONGUS': { nerve: 'Posterior interosseous', abbr: 'EPL', side: 'both' },
  'EXTENSOR POLLICIS BREVIS': { nerve: 'Posterior interosseous', abbr: 'EPB', side: 'both' },

  // Upper Limb - Median Nerve
  'PRONATOR TERES': { nerve: 'Median', abbr: 'Pte', side: 'both' },
  'FLEXOR CARPI RADIALIS': { nerve: 'Median', abbr: 'FCR', side: 'both' },
  'FLEXOR DIGITORUM SUPERFICIALIS': { nerve: 'Median', abbr: 'FDS', side: 'both' },
  'FLEXOR DIGITORUM PROFUNDUS': { nerve: 'Anterior interosseous', abbr: 'FDP', side: 'both', note: 'I AND II' },
  'FLEXOR POLLICIS LONGUS': { nerve: 'Anterior interosseous', abbr: 'FPL', side: 'both' },
  'ABDUCTOR POLLICIS BREVIS': { nerve: 'Median', abbr: 'APB', side: 'both' },
  'OPPONENS POLLICIS': { nerve: 'Median', abbr: null, side: 'both' },

  // Upper Limb - Ulnar Nerve
  'FLEXOR CARPI ULNARIS': { nerve: 'Ulnar', abbr: 'FCU', side: 'both', note: 'C7, C8, T1' },
  'ABDUCTOR DIGITI MINIMI': { nerve: 'Ulnar', abbr: 'ADM', side: 'both', note: 'C8, T1' },
  'FLEXOR DIGITI MINIMI': { nerve: 'Ulnar', abbr: 'FDM', side: 'both', note: 'C8, T1' },
  'ADDUCTOR POLLICIS': { nerve: 'Ulnar', abbr: null, side: 'both', note: 'C8, T1' },
  'INTEROSSEUS DORSALIS': { nerve: 'Ulnar', abbr: null, side: 'both', note: 'C8, T1 - First dorsal interosseous' },
  'DORSAL INTEROSSEOUS': { nerve: 'Ulnar', abbr: null, side: 'both', note: 'C8, T1' },
  'INTEROSSEUS PALMARIS': { nerve: 'Ulnar', abbr: null, side: 'both', note: 'C8, T1 - Palmar interosseous II' },
  'PALMAR INTEROSSEOUS': { nerve: 'Ulnar', abbr: null, side: 'both', note: 'C8, T1' },

  // Lower Limb
  'ILIOPSOAS': { nerve: 'Femoral/Spinal', abbr: null, side: 'both' },
  'QUADRICEPS FEMORIS': { nerve: 'Femoral', abbr: 'VM/RF/VL', side: 'both' },
  'VASTUS MEDIALIS': { nerve: 'Femoral', abbr: 'VM', side: 'both' },
  'VASTUS LATERALIS': { nerve: 'Femoral', abbr: 'VL', side: 'both' },
  'RECTUS FEMORIS': { nerve: 'Femoral', abbr: 'RF', side: 'both' },
  'ADDUCTOR': { nerve: 'Obturator', abbr: null, side: 'both' },
  'GLUTEUS MEDIUS': { nerve: 'Superior gluteal', abbr: 'GMe', side: 'both' },
  'GLUTEUS MINIMUS': { nerve: 'Superior gluteal', abbr: null, side: 'both' },
  'TENSOR FASCIAE LATAE': { nerve: 'Superior gluteal', abbr: 'TFL', side: 'both' },
  'GLUTEUS MAXIMUS': { nerve: 'Inferior gluteal', abbr: 'GMa', side: 'both' },
  'SEMITENDINOSUS': { nerve: 'Sciatic', abbr: null, side: 'both' },
  'SEMIMEMBRANOSUS': { nerve: 'Sciatic', abbr: null, side: 'both' },
  'BICEPS FEMORIS': { nerve: 'Sciatic', abbr: null, side: 'both' },
  'GASTROCNEMIUS': { nerve: 'Tibial', abbr: 'Ga', side: 'both' },
  'SOLEUS': { nerve: 'Tibial', abbr: 'So', side: 'both' },
  'TIBIALIS POSTERIOR': { nerve: 'Tibial', abbr: 'PT', side: 'both' },
  'FLEXOR DIGITORUM LONGUS': { nerve: 'Tibial', abbr: 'FDL', side: 'both' },
  'FLEXOR HALLUCIS LONGUS': { nerve: 'Tibial', abbr: 'FHL', side: 'both' },
  'TIBIALIS ANTERIOR': { nerve: 'Deep peroneal', abbr: 'TA', side: 'both' },
  'EXTENSOR DIGITORUM LONGUS': { nerve: 'Deep peroneal', abbr: 'EDL', side: 'both' },
  'EXTENSOR HALLUCIS LONGUS': { nerve: 'Deep peroneal', abbr: 'EHL', side: 'both' },
  'EXTENSOR DIGITORUM BREVIS': { nerve: 'Deep peroneal', abbr: 'EDB', side: 'both' },
  'PERONEUS LONGUS': { nerve: 'Superficial peroneal', abbr: 'PL', side: 'both' },
  'FIBULARIS LONGUS': { nerve: 'Superficial peroneal', abbr: 'PL', side: 'both' },
  'PERONEUS BREVIS': { nerve: 'Superficial peroneal', abbr: 'PB', side: 'both' },
  'FIBULARIS BREVIS': { nerve: 'Superficial peroneal', abbr: 'PB', side: 'both' },
};

/**
 * Check if a muscle name matches a priority muscle
 * @param {string} muscleName - The muscle name to check
 * @returns {boolean} - True if this is a priority muscle
 */
export function isPriorityMuscle(muscleName) {
  const normalized = muscleName.toUpperCase().trim();

  // Direct match
  for (const key of Object.keys(PRIORITY_MUSCLES)) {
    if (normalized.includes(key)) {
      return true;
    }
  }

  // Check for partial matches
  // Shoulder & Upper Back
  if (normalized.includes('TRAPEZIUS')) return true;
  if (normalized.includes('RHOMBOID')) return true;
  if (normalized.includes('SERRATUS ANTERIOR')) return true;
  if (normalized.includes('PECTORALIS MAJOR')) return true;
  if (normalized.includes('SUPRASPINATUS')) return true;
  if (normalized.includes('INFRASPINATUS')) return true;
  if (normalized.includes('LATISSIMUS DORSI')) return true;
  if (normalized.includes('TERES MAJOR')) return true;
  if (normalized.includes('DELTOID')) return true;

  // Upper Arm
  if (normalized.includes('BICEPS BRACHII')) return true;
  if (normalized.includes('TRICEPS BRACHII')) return true;
  if (normalized.includes('TRICEPS') && !normalized.includes('SURAE')) return true;

  // Forearm
  if (normalized.includes('BRACHIORADIALIS')) return true;
  if (normalized.includes('PRONATOR TERES')) return true;
  if (normalized.includes('SUPINATOR')) return true;
  if (normalized.includes('EXTENSOR CARPI')) return true;
  if (normalized.includes('FLEXOR CARPI')) return true;
  if (normalized.includes('EXTENSOR DIGITORUM') && !normalized.includes('SUPERFICIAL')) return true;
  if (normalized.includes('FLEXOR DIGITORUM')) return true;
  if (normalized.includes('POLLICIS')) return true;

  // Hand
  if (normalized.includes('INTEROSSEOUS') || normalized.includes('INTEROSSEUS')) return true;

  // Lower Limb
  if (normalized.includes('ILIOPSOAS')) return true;
  if (normalized.includes('QUADRICEPS')) return true;
  if (normalized.includes('VASTUS')) return true;
  if (normalized.includes('RECTUS FEMORIS')) return true;
  if (normalized.includes('BICEPS FEMORIS')) return true;
  if (normalized.includes('ADDUCTOR') && !normalized.includes('POLLICIS')) return true;
  if (normalized.includes('GLUTEUS')) return true;
  if (normalized.includes('TENSOR FASCIAE')) return true;
  if (normalized.includes('SEMITENDINOSUS')) return true;
  if (normalized.includes('SEMIMEMBRANOSUS')) return true;
  if (normalized.includes('GASTROCNEMIUS')) return true;
  if (normalized.includes('SOLEUS')) return true;
  if (normalized.includes('TIBIALIS')) return true;
  if (normalized.includes('PERONEUS') || normalized.includes('FIBULARIS')) return true;

  return false;
}

/**
 * Get priority badge info for a muscle
 * @param {string} muscleName
 * @returns {object|null} - Badge info or null
 */
export function getPriorityInfo(muscleName) {
  const normalized = muscleName.toUpperCase().trim();

  for (const [key, info] of Object.entries(PRIORITY_MUSCLES)) {
    if (normalized.includes(key)) {
      return info;
    }
  }

  return null;
}
