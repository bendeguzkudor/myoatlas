/**
 * Reflex Testing Data
 * Defines reflex grades, test definitions, and pyramidal signs
 * for neurological examination module
 */

export const REFLEX_GRADES = {
  areflexia: {
    label: 'Areflexia (0)',
    value: 0,
    color: '#7F1D1D',
    shortLabel: '0',
    description: 'No response'
  },
  hyporeflexia: {
    label: 'Hyporeflexia (+)',
    value: 1,
    color: '#F97316',
    shortLabel: '+',
    description: 'Diminished response'
  },
  normal: {
    label: 'Normal (++)',
    value: 2,
    color: '#10B981',
    shortLabel: '++',
    description: 'Expected response'
  },
  hyperreflexia: {
    label: 'Hyperreflexia (+++)',
    value: 3,
    color: '#EF4444',
    shortLabel: '+++',
    description: 'Exaggerated response'
  }
};

/**
 * Coordinate system: X=left-right, Y=vertical (up), Z=front-back
 * Model height ~30 scene units (head ~12, chest ~8, waist ~2, knees ~-8, feet ~-15)
 */
export const REFLEX_DEFINITIONS = {
  // ─── Upper Limb Reflexes ───
  biceps: {
    id: 'biceps',
    label: 'Biceps Reflex',
    description: 'Tests C5-C6 nerve roots',
    spinalLevel: 'C5-C6',
    nerve: 'Musculocutaneous nerve',
    region: 'upper_limb',
    bilateralRequired: true,
    testingNotes: 'Elbow flexed 90°. Place thumb on biceps tendon in antecubital fossa, strike thumb with hammer. Observe elbow flexion.',
    positions: {
      left: { x: -5.5, y: 6.5, z: 0.5 },   // Top position
      right: { x: 5.5, y: 6.5, z: 0.5 }
    }
  },

  triceps: {
    id: 'triceps',
    label: 'Triceps Reflex',
    description: 'Tests C6-C8 nerve roots',
    spinalLevel: 'C6-C8',
    nerve: 'Radial nerve',
    region: 'upper_limb',
    bilateralRequired: true,
    testingNotes: 'Elbow flexed, forearm hanging. Strike triceps tendon 2-3 cm above olecranon. Observe elbow extension.',
    positions: {
      left: { x: -5.5, y: 5.2, z: 0.0 },   // Second from top
      right: { x: 5.5, y: 5.2, z: 0.0 }
    }
  },

  brachioradialis: {
    id: 'brachioradialis',
    label: 'Brachioradialis Reflex',
    description: 'Tests C5-C6 nerve roots',
    spinalLevel: 'C5-C6',
    nerve: 'Radial nerve',
    region: 'upper_limb',
    bilateralRequired: true,
    testingNotes: 'Forearm resting in mid-pronation. Strike styloid process of radius (thumb side of wrist). Observe forearm flexion and supination.',
    color: '#F59E0B', // Amber
    positions: {
      left: { x: -6.0, y: 3.9, z: 0.5 },   // Third from top
      right: { x: 6.0, y: 3.9, z: 0.5 }
    }
  },

  radius: {
    id: 'radius',
    label: 'Radius Reflex',
    description: 'Tests C5-C6 nerve roots',
    spinalLevel: 'C5-C6',
    nerve: 'Radial nerve',
    region: 'upper_limb',
    bilateralRequired: true,
    testingNotes: 'Strike distal radius at wrist (thumb side). Observe flexion and pronation of forearm.',
    color: '#10B981', // Green
    positions: {
      left: { x: -6.0, y: 2.6, z: 0.0 },   // Fourth from top
      right: { x: 6.0, y: 2.6, z: 0.0 }
    }
  },

  ulna: {
    id: 'ulna',
    label: 'Ulna Reflex',
    description: 'Tests C7-C8 nerve roots',
    spinalLevel: 'C7-C8',
    nerve: 'Ulnar nerve',
    region: 'upper_limb',
    bilateralRequired: true,
    testingNotes: 'Strike styloid process of ulna (pinky side of wrist). Observe pronation of forearm.',
    color: '#EC4899', // Pink
    positions: {
      left: { x: -6.0, y: 1.3, z: -0.5 },  // Fifth from top (bottom of upper limb)
      right: { x: 6.0, y: 1.3, z: -0.5 }
    }
  },

  // ─── Lower Limb Reflexes ───
  patellar: {
    id: 'patellar',
    label: 'Patellar Reflex',
    description: 'Knee-jerk reflex - tests L2-L4 nerve roots',
    spinalLevel: 'L2-L4',
    nerve: 'Femoral nerve',
    region: 'lower_limb',
    bilateralRequired: true,
    testingNotes: 'Patient seated with legs dangling. Strike patellar tendon just below patella with reflex hammer. Observe quadriceps contraction and knee extension.',
    positions: {
      left: { x: -4.0, y: -8.5, z: 0.5 },  // Left - beside body
      right: { x: 4.0, y: -8.5, z: 0.5 }   // Right - beside body
    }
  },

  achilles: {
    id: 'achilles',
    label: 'Achilles Reflex',
    description: 'Ankle-jerk reflex - tests S1-S2 nerve roots',
    spinalLevel: 'S1-S2',
    nerve: 'Tibial nerve',
    region: 'lower_limb',
    bilateralRequired: true,
    testingNotes: 'Patient kneeling or foot dorsiflexed. Strike Achilles tendon. Observe plantar flexion of foot.',
    positions: {
      left: { x: -3.5, y: -12.5, z: 0.0 }, // Left - beside body
      right: { x: 3.5, y: -12.5, z: 0.0 }  // Right - beside body
    }
  }
};

export const PYRAMIDAL_SIGNS = {
  // ─── Lower Limb Signs ───
  babinski: {
    id: 'babinski',
    label: 'Babinski Sign',
    description: 'Upward extension of great toe with fanning of other toes',
    region: 'lower_limb',
    testingNotes: 'Stroke lateral plantar surface of foot from heel to toes with firm pressure using blunt object',
    significance: 'Indicates upper motor neuron lesion when present',
    normalResponse: 'Plantar flexion of toes (downward curl)',
    pathologicalResponse: 'Dorsiflexion of great toe (upward) with toe fanning'
  },

  chaddock: {
    id: 'chaddock',
    label: 'Chaddock Sign',
    description: 'Alternative method to elicit Babinski response',
    region: 'lower_limb',
    testingNotes: 'Stroke lateral aspect of foot from heel to little toe beneath lateral malleolus',
    significance: 'Indicates upper motor neuron lesion when present',
    normalResponse: 'No response or plantar flexion',
    pathologicalResponse: 'Dorsiflexion of great toe with toe fanning'
  },

  gordon: {
    id: 'gordon',
    label: 'Gordon Sign',
    description: 'Calf squeeze test',
    region: 'lower_limb',
    testingNotes: 'Squeeze calf muscles firmly. Patient should be relaxed with leg extended.',
    significance: 'Indicates upper motor neuron lesion when present',
    normalResponse: 'No response or plantar flexion',
    pathologicalResponse: 'Dorsiflexion of great toe'
  },

  oppenheim: {
    id: 'oppenheim',
    label: 'Oppenheim Sign',
    description: 'Tibial stroke test',
    region: 'lower_limb',
    testingNotes: 'Apply firm downward pressure along anterior tibial surface from knee to ankle',
    significance: 'Indicates upper motor neuron lesion when present',
    normalResponse: 'No response or plantar flexion',
    pathologicalResponse: 'Dorsiflexion of great toe with toe fanning'
  },

  schaefer: {
    id: 'schaefer',
    label: 'Schaefer Sign',
    description: 'Achilles tendon squeeze test',
    region: 'lower_limb',
    testingNotes: 'Pinch or squeeze Achilles tendon firmly. Patient prone or kneeling.',
    significance: 'Indicates upper motor neuron lesion when present',
    normalResponse: 'Plantar flexion',
    pathologicalResponse: 'Dorsiflexion of great toe'
  },

  // ─── Upper Limb Signs ───
  hoffman: {
    id: 'hoffman',
    label: 'Hoffman Sign',
    description: 'Finger flexion reflex',
    region: 'upper_limb',
    testingNotes: 'Hold middle finger loosely and flick the nail downward briskly. Hand should be relaxed.',
    significance: 'Indicates upper motor neuron lesion or cervical myelopathy when present',
    normalResponse: 'No flexion of thumb or fingers',
    pathologicalResponse: 'Flexion and adduction of thumb, flexion of index finger'
  },

  tromner: {
    id: 'tromner',
    label: 'Trömner Sign',
    description: 'Alternative finger flexion reflex test',
    region: 'upper_limb',
    testingNotes: 'Tap volar surface of middle or index fingertip briskly with your finger. Hand relaxed and slightly extended.',
    significance: 'Indicates upper motor neuron lesion or cervical myelopathy when present',
    normalResponse: 'No flexion of thumb or fingers',
    pathologicalResponse: 'Flexion of thumb and fingers'
  }
};
