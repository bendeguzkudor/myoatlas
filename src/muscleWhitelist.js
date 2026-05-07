/**
 * Muscle whitelist for neuromodulation use case.
 * Only muscles matching these patterns will be loaded from the GLB files.
 *
 * Patterns match normalized mesh names (lowercase, underscores → spaces).
 * Each pattern matches both left and right sides automatically.
 *
 * Based on neuromodell.docx - approximately 30 upper/lower limb muscles
 * for radial, median, ulnar, femoral, obturator, gluteal, sciatic, tibial, and peroneal nerves.
 */

export const MUSCLE_WHITELIST = [
  // ─── DIRECT CRANIAL / CERVICAL ───
  'trapezius',

  // ─── SHOULDER GIRDLE / PLEXUS BRACHIALIS ───
  'rhomboid',
  'rhomboideus',
  'serratus anterior',
  'clavicular part of left pectoralis major',
  'clavicular part of right pectoralis major',
  'sternocostal part of left pectoralis major',
  'sternocostal part of right pectoralis major',
  'supraspinatus',
  'infraspinatus',
  'latissimus dorsi',
  'teres major',
  'deltoid',
  'deltoideus',
  'biceps brachii',

  // ─── UPPER LIMB (Radial, Median, Ulnar nerves) ───

  // Radial nerve
  'triceps brachii',               // all heads (lateral, medial, long)
  'brachioradialis',
  'extensor carpi radialis longus',
  'supinator',
  'extensor carpi ulnaris',
  'extensor digitorum',
  'abductor pollicis longus',
  'extensor pollicis longus',
  'extensor pollicis brevis',

  // Median nerve
  'pronator teres',
  'flexor carpi radialis',
  'flexor digitorum superficialis',
  'flexor digitorum profundus',    // lateral part (digits 2-3)
  'flexor pollicis longus',
  'abductor pollicis brevis',
  'opponens pollicis',
  'lumbricals',

  // Ulnar nerve
  'flexor carpi ulnaris',
  'abductor digiti minimi',        // hand
  'flexor digiti minimi',          // hand
  'interossei',                    // hand interossei sets
  'interosseous',                  // legacy singular/plural variants
  'adductor pollicis',

  // ─── LOWER LIMB (Femoral, Obturator, Gluteal, Sciatic, Tibial, Peroneal nerves) ───

  // Femoral nerve
  'iliopsoas',                     // includes iliacus + psoas major
  'iliacus',
  'psoas major',
  'rectus femoris',
  'vastus medialis',
  'vastus lateralis',
  'vastus intermedius',

  // Obturator nerve
  'adductor',                      // adductor longus, brevis, magnus

  // Superior gluteal nerve
  'gluteus medius',
  'gluteus minimus',
  'tensor fasciae latae',

  // Inferior gluteal nerve
  'gluteus maximus',

  // Sciatic nerve (tibial + common fibular divisions)
  'biceps femoris',                // long head (tibial) + short head (fibular)
  'semitendinosus',
  'semimembranosus',

  // Tibial nerve
  'gastrocnemius',
  'soleus',
  'tibialis posterior',
  'flexor digitorum longus',       // foot
  'flexor hallucis longus',

  // Deep fibular (peroneal) nerve
  'tibialis anterior',
  'extensor digitorum longus',     // foot
  'extensor hallucis longus',
  'extensor digitorum brevis',     // foot
  'extensor hallucis brevis',      // foot short extensors

  // Superficial fibular (peroneal) nerve
  'fibularis longus',              // also called peroneus longus
  'fibularis brevis',              // also called peroneus brevis
  'peroneus longus',
  'peroneus brevis',

  // Intrinsic foot muscles listed as "A lab kis izmai" in the PDF
  'abductor hallucis',
  'flexor digitorum brevis',
  'flexor accessorius',
  'flexor hallucis brevis',
  'adductor hallucis',
  'opponens digiti minimi',
  'lumbrical',
  'plantar interosseous',
];
