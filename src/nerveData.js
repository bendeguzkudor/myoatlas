/**
 * Nerve innervation mapping for ~50 clinically relevant muscles.
 * Based on neuromodell.docx — maps peripheral nerves to their target muscles
 * with match patterns for BodyParts3D/Z-Anatomy mesh names.
 *
 * Naming note: BP3D uses modern anatomical names (e.g. "fibularis longus")
 * while clinical practice often uses older names (e.g. "Peroneus Longus").
 * The `displayName` shows the clinical name; `matchPatterns` match mesh rawNames.
 */

export const NERVE_GROUPS = {
  ACCESSORY: {
    label: 'N. Accessorius',
    region: 'upper_extremity',
    color: '#94a3b8',
    muscles: [
      { name: 'Trapezius', segments: 'CN XI, C3, C4', matchPatterns: ['trapezius'] },
    ],
  },
  DORSAL_SCAPULAR: {
    label: 'N. Dorsalis Scapulae',
    region: 'upper_extremity',
    color: '#64748b',
    muscles: [
      { name: 'Rhomboideus', segments: 'C4, C5', matchPatterns: ['rhomboid'] },
    ],
  },
  LONG_THORACIC: {
    label: 'N. Thoracicus Longus',
    region: 'upper_extremity',
    color: '#0ea5e9',
    muscles: [
      { name: 'Serratus Anterior', segments: 'C5, C6, C7', matchPatterns: ['serratus anterior'] },
    ],
  },
  PECTORAL: {
    label: 'Nn. Pectorales',
    region: 'upper_extremity',
    color: '#f59e0b',
    muscles: [
      { name: 'Pectoralis Major - pars clavicularis', segments: 'C5, C6', nerve: 'N. pectoralis lateralis', matchPatterns: ['clavicular', 'pectoralis major'] },
      { name: 'Pectoralis Major - pars sternocostalis', segments: 'C6, C7, C8', nerve: 'Nn. pectorales lateralis et medialis', matchPatterns: ['sternocostal', 'pectoralis major'] },
    ],
  },
  SUPRASCAPULAR: {
    label: 'N. Suprascapularis',
    region: 'upper_extremity',
    color: '#22c55e',
    muscles: [
      { name: 'Supraspinatus', segments: 'C5, C6', matchPatterns: ['supraspinatus'] },
      { name: 'Infraspinatus', segments: 'C5, C6', matchPatterns: ['infraspinatus'] },
    ],
  },
  THORACODORSAL: {
    label: 'N. Thoracodorsalis',
    region: 'upper_extremity',
    color: '#14b8a6',
    muscles: [
      { name: 'Latissimus Dorsi', segments: 'C6, C7, C8', matchPatterns: ['latissimus dorsi'] },
    ],
  },
  SUBSCAPULAR: {
    label: 'N. Subscapularis',
    region: 'upper_extremity',
    color: '#84cc16',
    muscles: [
      { name: 'Teres Major', segments: 'C5, C6, C7', matchPatterns: ['teres major'] },
    ],
  },
  AXILLARY: {
    label: 'N. Axillaris',
    region: 'upper_extremity',
    color: '#a855f7',
    muscles: [
      { name: 'Deltoideus', segments: 'C5, C6', matchPatterns: ['deltoid'] },
    ],
  },
  MUSCULOCUTANEOUS: {
    label: 'N. Musculocutaneus',
    region: 'upper_extremity',
    color: '#ec4899',
    muscles: [
      { name: 'Biceps Brachii', segments: 'C5, C6', matchPatterns: ['biceps brachii'] },
    ],
  },
  N_RADIALIS: {
    label: 'N. Radialis',
    region: 'upper_extremity',
    color: '#e74c3c',
    muscles: [
      { name: 'Triceps Brachii', segments: 'C6, C7, C8', matchPatterns: ['triceps brachii'] },
      { name: 'Brachioradialis', segments: 'C5, C6', matchPatterns: ['brachioradialis'] },
      { name: 'Extensor Carpi Radialis Longus', segments: 'C5, C6', matchPatterns: ['extensor carpi radialis longus'] },
      { name: 'Supinator', segments: 'C6, C7', matchPatterns: ['supinator'] },
      { name: 'Extensor Carpi Ulnaris', segments: 'C7, C8', nerve: 'N. interosseus posterior', matchPatterns: ['extensor carpi ulnaris'] },
      { name: 'Extensor Digitorum', segments: 'C7, C8', nerve: 'N. interosseus posterior', matchPatterns: ['extensor digitorum'] },
      { name: 'Abductor Pollicis Longus', segments: 'C7, C8', nerve: 'N. interosseus posterior', matchPatterns: ['abductor pollicis longus'] },
      { name: 'Extensor Pollicis Brevis', segments: 'C7, C8', nerve: 'N. interosseus posterior', matchPatterns: ['extensor pollicis brevis'] },
      { name: 'Extensor Pollicis Longus', segments: 'C7, C8', nerve: 'N. interosseus posterior', matchPatterns: ['extensor pollicis longus'] },
    ],
  },
  N_MEDIANUS: {
    label: 'N. Medianus',
    region: 'upper_extremity',
    color: '#3498db',
    muscles: [
      { name: 'Pronator Teres', segments: 'C6, C7', matchPatterns: ['pronator teres'] },
      { name: 'Flexor Carpi Radialis', segments: 'C6, C7', matchPatterns: ['flexor carpi radialis'] },
      { name: 'Flexor Digitorum Superficialis', segments: 'C7, C8, T1', matchPatterns: ['flexor digitorum superficialis'] },
      { name: 'Flexor Digitorum Profundus I-II', segments: 'C7, C8', nerve: 'N. interosseus anterior', matchPatterns: ['flexor digitorum profundus'] },
      { name: 'Flexor Pollicis Longus', segments: 'C7, C8', nerve: 'N. interosseus anterior', matchPatterns: ['flexor pollicis longus'] },
      { name: 'Abductor Pollicis Brevis', segments: 'C8, T1', matchPatterns: ['abductor pollicis brevis'] },
      { name: 'Opponens Pollicis', segments: 'C8, T1', matchPatterns: ['opponens pollicis'] },
      { name: 'Lumbricalis I', segments: 'C8, T1', matchPatterns: ['lumbricals', 'hand'] },
    ],
  },
  N_ULNARIS: {
    label: 'N. Ulnaris',
    region: 'upper_extremity',
    color: '#2ecc71',
    muscles: [
      { name: 'Flexor Carpi Ulnaris', segments: 'C7, C8, T1', matchPatterns: ['flexor carpi ulnaris'] },
      { name: 'Flexor Digitorum Profundus III-IV', segments: 'C7, C8', matchPatterns: ['flexor digitorum profundus'] },
      { name: 'Abductor Digiti Minimi (Hand)', segments: 'C8, T1', matchPatterns: ['abductor digiti minimi', 'hand'] },
      { name: 'Flexor Digiti Minimi', segments: 'C8, T1', matchPatterns: ['flexor digiti minimi', 'hand'] },
      { name: 'First Dorsal Interosseous', segments: 'C8, T1', matchPatterns: ['dorsal inteross', 'hand'] },
      { name: 'Palmar Interosseous II', segments: 'C8, T1', matchPatterns: ['palmar inteross', 'hand'] },
      { name: 'Adductor Pollicis', segments: 'C8, T1', matchPatterns: ['adductor pollicis'] },
    ],
  },
  FEMORAL: {
    label: 'N. Femoralis',
    region: 'lower_extremity',
    color: '#e67e22',
    muscles: [
      { name: 'Iliopsoas', segments: 'L1, L2, L3', matchPatterns: ['iliacus', 'psoas major'] },
      { name: 'Rectus Femoris', segments: 'L2, L3, L4', matchPatterns: ['rectus femoris'] },
      { name: 'Vastus Medialis', segments: 'L2, L3, L4', matchPatterns: ['vastus medialis'] },
      { name: 'Vastus Lateralis', segments: 'L2, L3, L4', matchPatterns: ['vastus lateralis'] },
      { name: 'Vastus Intermedius', segments: 'L2, L3, L4', matchPatterns: ['vastus intermedius'] },
      { name: 'Sartorius', segments: 'L2, L3', matchPatterns: ['sartorius'] },
    ],
  },
  OBTURATOR: {
    label: 'N. Obturatorius',
    region: 'lower_extremity',
    color: '#9b59b6',
    muscles: [
      { name: 'Adductor Longus', segments: 'L2, L3, L4', matchPatterns: ['adductor longus'] },
      { name: 'Adductor Brevis', segments: 'L2, L3, L4', matchPatterns: ['adductor brevis'] },
      { name: 'Adductor Magnus', segments: 'L2, L3, L4', matchPatterns: ['adductor magnus'] },
      { name: 'Gracilis', segments: 'L2, L3', matchPatterns: ['gracilis'] },
      { name: 'Pectineus', segments: 'L2, L3', matchPatterns: ['pectineus'] },
    ],
  },
  SUP_GLUTEAL: {
    label: 'N. Gluteus Superior',
    region: 'lower_extremity',
    color: '#1abc9c',
    muscles: [
      { name: 'Gluteus Medius', segments: 'L4, L5, S1', matchPatterns: ['gluteus medius'] },
      { name: 'Gluteus Minimus', segments: 'L4, L5, S1', matchPatterns: ['gluteus minimus'] },
      { name: 'Tensor Fasciae Latae', segments: 'L4, L5, S1', matchPatterns: ['tensor fasciae'] },
    ],
  },
  INF_GLUTEAL: {
    label: 'N. Gluteus Inferior',
    region: 'lower_extremity',
    color: '#d35400',
    muscles: [
      { name: 'Gluteus Maximus', segments: 'L5, S1, S2', matchPatterns: ['gluteus maximus'] },
    ],
  },
  SCIATIC: {
    label: 'N. Ischiadicus',
    region: 'lower_extremity',
    color: '#c0392b',
    muscles: [
      { name: 'Semitendinosus', segments: 'L5, S1, S2', matchPatterns: ['semitendinosus'] },
      { name: 'Semimembranosus', segments: 'L5, S1, S2', matchPatterns: ['semimembranosus'] },
      { name: 'Biceps Femoris', segments: 'L5, S1, S2', matchPatterns: ['biceps femoris'] },
    ],
  },
  TIBIAL: {
    label: 'N. Tibialis',
    region: 'lower_extremity',
    color: '#8e44ad',
    muscles: [
      { name: 'Gastrocnemius', segments: 'S1, S2', matchPatterns: ['gastrocnemius'] },
      { name: 'Soleus', segments: 'S1, S2', matchPatterns: ['soleus'] },
      { name: 'Tibialis Posterior', segments: 'L4, L5', matchPatterns: ['tibialis posterior'] },
      { name: 'Flexor Digitorum Longus', segments: 'L5, S1, S2', matchPatterns: ['flexor digitorum longus'] },
      { name: 'Flexor Hallucis Longus', segments: 'L5, S1, S2', matchPatterns: ['flexor hallucis longus'] },
    ],
  },
  PLANTAR: {
    label: 'Nn. Plantares',
    region: 'lower_extremity',
    color: '#65a30d',
    muscles: [
      { name: 'Small Muscles of the Foot', segments: 'S1, S2', matchPatterns: ['foot'] },
      { name: 'Abductor Hallucis', segments: 'S1, S2', nerve: 'N. plantaris medialis', matchPatterns: ['abductor hallucis'] },
      { name: 'Flexor Digitorum Brevis', segments: 'S1, S2', nerve: 'N. plantaris medialis', matchPatterns: ['flexor digitorum brevis'] },
      { name: 'Flexor Accessorius', segments: 'S1, S2', nerve: 'N. plantaris lateralis', matchPatterns: ['flexor accessorius'] },
      { name: 'Flexor Hallucis Brevis', segments: 'S1, S2', nerve: 'N. plantaris medialis', matchPatterns: ['flexor hallucis brevis'] },
      { name: 'Adductor Hallucis', segments: 'S1, S2', nerve: 'N. plantaris lateralis', matchPatterns: ['adductor hallucis'] },
      { name: 'Abductor Digiti Minimi (Foot)', segments: 'S1, S2', nerve: 'N. plantaris lateralis', matchPatterns: ['abductor digiti minimi', 'foot'] },
      { name: 'Flexor Digiti Minimi Brevis (Foot)', segments: 'S1, S2', nerve: 'N. plantaris lateralis', matchPatterns: ['flexor digiti minimi', 'foot'] },
      { name: 'Lumbricals (Foot)', segments: 'S1, S2', matchPatterns: ['lumbrical', 'foot'] },
      { name: 'Plantar Interossei', segments: 'S1, S2', nerve: 'N. plantaris lateralis', matchPatterns: ['plantar interosseous'] },
    ],
  },
  DEEP_PERONEAL: {
    label: 'N. Fibularis Profundus',
    region: 'lower_extremity',
    color: '#16a085',
    muscles: [
      { name: 'Tibialis Anterior', segments: 'L4, L5', matchPatterns: ['tibialis anterior'] },
      { name: 'Extensor Digitorum Longus', segments: 'L5, S1', matchPatterns: ['extensor digitorum longus'] },
      { name: 'Extensor Hallucis Longus', segments: 'L5, S1', matchPatterns: ['extensor hallucis longus'] },
      { name: 'Extensor Digitorum Brevis', segments: 'L5, S1', matchPatterns: ['extensor digitorum brevis'] },
    ],
  },
  SUPERFICIAL_PERONEAL: {
    label: 'N. Fibularis Superficialis',
    region: 'lower_extremity',
    color: '#27ae60',
    muscles: [
      // BP3D uses "fibularis" not "peroneus"
      { name: 'Peroneus Longus', segments: 'L5, S1', matchPatterns: ['fibularis longus'] },
      { name: 'Peroneus Brevis', segments: 'L5, S1', matchPatterns: ['fibularis brevis'] },
    ],
  },
};

/**
 * Build a map from mesh rawName (lowercase) to nerve key(s).
 * A mesh can map to multiple nerves (e.g. flexor digitorum profundus → median + ulnar).
 * @param {THREE.Mesh[]} muscleMeshes - Array of loaded muscle meshes
 * @returns {Map<string, string[]>} rawName → [nerveKey, ...]
 */
export function buildNerveMeshMap(muscleMeshes) {
  const map = new Map(); // rawName → [nerveKey, ...]

  for (const mesh of muscleMeshes) {
    const rawName = (mesh.userData.muscleData?.rawName || mesh.name || '').toLowerCase();
    if (!rawName) continue;

    for (const [nerveKey, nerve] of Object.entries(NERVE_GROUPS)) {
      for (const muscle of nerve.muscles) {
        const matches = muscle.matchPatterns.every(pattern =>
          rawName.includes(pattern.toLowerCase())
        );
        if (matches) {
          if (!map.has(rawName)) map.set(rawName, []);
          const list = map.get(rawName);
          if (!list.includes(nerveKey)) list.push(nerveKey);
        }
      }
    }
  }

  return map;
}
