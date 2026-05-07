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
  'LUMBRICALS OF HAND': { nerve: 'Median/Ulnar', abbr: null, side: 'both', note: 'Lumbricalis I in PDF; mesh is grouped lumbricals' },

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

  // Intrinsic foot muscles - "A lab kis izmai" in PDF
  'ABDUCTOR HALLUCIS': { nerve: 'Medial plantar', abbr: null, side: 'both', note: 'Small intrinsic foot muscles' },
  'FLEXOR DIGITORUM BREVIS': { nerve: 'Medial plantar', abbr: 'FDB', side: 'both', note: 'Small intrinsic foot muscles' },
  'FLEXOR ACCESSORIUS': { nerve: 'Lateral plantar', abbr: null, side: 'both', note: 'Quadratus plantae / small intrinsic foot muscles' },
  'FLEXOR HALLUCIS BREVIS': { nerve: 'Medial plantar', abbr: 'FHB', side: 'both', note: 'Small intrinsic foot muscles' },
  'ADDUCTOR HALLUCIS': { nerve: 'Lateral plantar', abbr: null, side: 'both', note: 'Small intrinsic foot muscles' },
  'ABDUCTOR DIGITI MINIMI OF FOOT': { nerve: 'Lateral plantar', abbr: null, side: 'both', note: 'Small intrinsic foot muscles' },
  'FLEXOR DIGITI MINIMI BREVIS OF FOOT': { nerve: 'Lateral plantar', abbr: null, side: 'both', note: 'Small intrinsic foot muscles' },
  'OPPONENS DIGITI MINIMI OF FOOT': { nerve: 'Lateral plantar', abbr: null, side: 'both', note: 'Small intrinsic foot muscles' },
  'LUMBRICAL OF FOOT': { nerve: 'Medial/Lateral plantar', abbr: null, side: 'both', note: 'Small intrinsic foot muscles' },
  'PLANTAR INTEROSSEOUS': { nerve: 'Lateral plantar', abbr: null, side: 'both', note: 'Small intrinsic foot muscles' },
};

/**
 * Check if a muscle name matches a priority muscle
 * @param {string} muscleName - The muscle name to check
 * @returns {boolean} - True if this is a priority muscle
 */
export function isPriorityMuscle(muscleName) {
  const normalized = normalizePriorityName(muscleName);

  return Object.keys(PRIORITY_MUSCLES).some(key => priorityNameMatches(normalized, key));
}

/**
 * Get priority badge info for a muscle
 * @param {string} muscleName
 * @returns {object|null} - Badge info or null
 */
export function getPriorityInfo(muscleName) {
  const normalized = normalizePriorityName(muscleName);

  for (const [key, info] of Object.entries(PRIORITY_MUSCLES)) {
    if (priorityNameMatches(normalized, key)) {
      return info;
    }
  }

  return null;
}

function normalizePriorityName(muscleName) {
  return muscleName
    .toUpperCase()
    .replace(/\s*\(\d+\)\s*$/, '')
    .replace(/_/g, ' ')
    .replace(/\b(LEFT|RIGHT)\b/g, '')
    .replace(/^.+?\s+(PART|HEAD|BELLY)\s+OF\s+/i, '')
    .replace(/^SET\s+OF\s+/i, '')
    .replace(/^(FIRST|SECOND|THIRD|FOURTH|FIFTH)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function priorityNameMatches(normalized, key) {
  if (normalized === key) return true;

  const exactAliases = {
    DELTOID: ['DELTOIDEUS'],
    DELTOIDEUS: ['DELTOID'],
    TRICEPS: ['TRICEPS BRACHII'],
    ILIOPSOAS: ['ILIACUS', 'PSOAS MAJOR'],
    'LUMBRICALS OF HAND': ['LUMBRICALIS I'],
    'ABDUCTOR DIGITI MINIMI': ['ABDUCTOR DIGITI MINIMI OF HAND'],
    'FLEXOR DIGITI MINIMI': ['FLEXOR DIGITI MINIMI OF HAND', 'FLEXOR DIGITI MINIMI BREVIS OF HAND'],
    'DORSAL INTEROSSEOUS': ['DORSAL INTEROSSEI OF HAND'],
    'INTEROSSEUS DORSALIS': ['DORSAL INTEROSSEI OF HAND'],
    'PALMAR INTEROSSEOUS': ['PALMAR INTEROSSEI OF HAND'],
    'INTEROSSEUS PALMARIS': ['PALMAR INTEROSSEI OF HAND'],
    'QUADRICEPS FEMORIS': ['RECTUS FEMORIS', 'VASTUS MEDIALIS', 'VASTUS LATERALIS', 'VASTUS INTERMEDIUS'],
    'PERONEUS LONGUS': ['FIBULARIS LONGUS'],
    'PERONEUS BREVIS': ['FIBULARIS BREVIS'],
    'FIBULARIS LONGUS': ['PERONEUS LONGUS'],
    'FIBULARIS BREVIS': ['PERONEUS BREVIS']
  };

  if (exactAliases[key]?.includes(normalized)) return true;

  if (key === 'ADDUCTOR') {
    return normalized.startsWith('ADDUCTOR ') &&
      !normalized.includes('POLLICIS') &&
      !normalized.includes('HALLUCIS');
  }

  const preciseContains = [
    'RHOMBOID',
    'TRAPEZIUS',
    'PECTORALIS MAJOR',
    'BICEPS BRACHII',
    'TRICEPS BRACHII',
    'LUMBRICALS OF HAND'
  ];

  return preciseContains.includes(key) && normalized.includes(key);
}
