const m = (...meshNames) => meshNames;

export const EXAM_MUSCLE_GROUPS = [
  {
    heading: 'Nervus Accessorius',
    entries: [
      {
        label: 'M. TRAPEZIUS',
        meshNames: m(
          'ascending part of left trapezius',
          'ascending part of right trapezius',
          'descending part of left trapezius',
          'descending part of right trapezius',
          'transverse part of left trapezius',
          'transverse part of right trapezius',
        ),
      },
    ],
  },
  {
    heading: 'Plexus Brachialis',
    entries: [
      {
        label: 'M. RHOMBOIDEUS',
        meshNames: m(
          'left rhomboid major',
          'right rhomboid major',
          'left rhomboid minor',
          'right rhomboid minor',
        ),
      },
      {
        label: 'M. SERRATUS ANTERIOR',
        meshNames: m('left serratus anterior', 'right serratus anterior'),
      },
      {
        label: 'M. PECTORALIS MAJOR: PARS CLAVICULARIS',
        meshNames: m('clavicular part of left pectoralis major', 'clavicular part of right pectoralis major'),
      },
      {
        label: 'M. PECTORALIS MAJOR: PARS STERNOCOSTALIS',
        meshNames: m('sternocostal part of left pectoralis major', 'sternocostal part of right pectoralis major'),
      },
      {
        label: 'M. SUPRASPINATUS',
        meshNames: m('left supraspinatus', 'right supraspinatus'),
      },
      {
        label: 'M. INFRASPINATUS',
        meshNames: m('left infraspinatus muscle', 'right infraspinatus muscle'),
      },
      {
        label: 'M. LATISSIMUS DORSI',
        meshNames: m('left latissimus dorsi', 'right latissimus dorsi'),
      },
      {
        label: 'TERES MAJOR',
        meshNames: m('left teres major', 'right teres major'),
      },
    ],
  },
  {
    heading: 'Nervus Musculocutaneus',
    entries: [
      {
        label: 'M. BICEPS BRACHII',
        meshNames: m(
          'long head of left biceps brachii',
          'long head of right biceps brachii',
          'short head of left biceps brachii',
          'short head of right biceps brachii',
        ),
      },
    ],
  },
  {
    heading: 'Nervus Axillaris',
    entries: [
      {
        label: 'M. DELTOIDEUS',
        meshNames: m(
          'acromial part of left deltoid',
          'acromial part of right deltoid',
          'clavicular part of left deltoid',
          'clavicular part of right deltoid',
          'spinal part of left deltoid',
          'spinal part of right deltoid',
        ),
      },
    ],
  },
  {
    heading: 'Nervus Radialis',
    entries: [
      {
        label: 'M. TRICEPS BRACHII',
        meshNames: m(
          'lateral head of left triceps brachii',
          'lateral head of right triceps brachii',
          'long head of left triceps brachii',
          'long head of right triceps brachii',
          'medial head of left triceps brachii',
          'medial head of right triceps brachii',
        ),
      },
      {
        label: 'M. BRACHIORADIALIS',
        meshNames: m('left brachioradialis', 'right brachioradialis'),
      },
      {
        label: 'M. SUPINATOR',
        meshNames: m('left supinator', 'right supinator'),
      },
      {
        label: 'M. EXTENSOR CARPI RADIALIS LONGUS',
        meshNames: m('left extensor carpi radialis longus', 'right extensor carpi radialis longus'),
      },
      {
        label: 'M. EXTENSOR CARPI ULNARIS',
        meshNames: m('left extensor carpi ulnaris', 'right extensor carpi ulnaris'),
      },
      {
        label: 'M. ABDUCTOR POLLICIS LONGUS',
        meshNames: m('left abductor pollicis longus', 'right abductor pollicis longus'),
      },
      {
        label: 'M. EXTENSOR DIGITORUM',
        meshNames: m('left extensor digitorum', 'right extensor digitorum'),
      },
      {
        label: 'M. EXTENSOR POLLICIS LONGUS',
        meshNames: m('left extensor pollicis longus', 'right extensor pollicis longus'),
      },
      {
        label: 'M. EXTENSOR POLLICIS BREVIS',
        meshNames: m('left extensor pollicis brevis', 'right extensor pollicis brevis'),
      },
    ],
  },
  {
    heading: 'Nervus Medianus',
    entries: [
      {
        label: 'M. PRONATOR TERES',
        meshNames: m(
          'humeral head of left pronator teres',
          'humeral head of right pronator teres',
          'ulnar head of left pronator teres',
          'ulnar head of right pronator teres',
        ),
      },
      {
        label: 'M. FLEXOR CARPI RADIALIS',
        meshNames: m('left flexor carpi radialis', 'right flexor carpi radialis'),
      },
      {
        label: 'M. FLEXOR DIGITORUM SUPERFICIALIS',
        meshNames: m(
          'left flexor digitorum superficialis',
          'right flexor digitorum superficialis',
        ),
      },
      {
        label: 'M. FLEXOR DIGITORUM PROFUNDUS I & II',
        meshNames: m('left flexor digitorum profundus', 'right flexor digitorum profundus'),
      },
      {
        label: 'M. ABDUCTOR POLLICIS BREVIS',
        meshNames: m('left abductor pollicis brevis', 'right abductor pollicis brevis'),
      },
      {
        label: 'M. LUMBRICALIS I & INTEROSSEUS',
        meshNames: m(
          'set of lumbricals of left hand',
          'set of lumbricals of right hand',
          'set of dorsal interossei of left hand',
          'set of dorsal interossei of right hand',
          'set of palmar interossei of left hand',
          'set of palmar interossei of right hand',
        ),
      },
      {
        label: 'M. FLEXOR POLLICIS LONGUS',
        meshNames: m('left flexor pollicis longus', 'right flexor pollicis longus'),
      },
      {
        label: 'M. OPPONENS POLLICIS',
        meshNames: m('left opponens pollicis', 'right opponens pollicis'),
      },
    ],
  },
  {
    heading: 'Nervus Ulnaris',
    entries: [
      {
        label: 'M. FLEXOR CARPI ULNARIS',
        meshNames: m(
          'humeral head of left flexor carpi ulnaris',
          'humeral head of right flexor carpi ulnaris',
          'ulnar head of left flexor carpi ulnaris',
          'ulnar head of right flexor carpi ulnaris',
        ),
      },
      {
        label: 'M. FLEXOR DIGITORUM PROFUNDUS III & IV',
        meshNames: m('left flexor digitorum profundus', 'right flexor digitorum profundus'),
      },
      {
        label: 'M. ADDUCTOR POLLICIS',
        meshNames: m(
          'oblique head of left adductor pollicis',
          'oblique head of right adductor pollicis',
          'transverse head of left adductor pollicis',
          'transverse head of right adductor pollicis',
        ),
      },
      {
        label: 'M. ABDUCTOR DIGITI MINIMI',
        meshNames: m('abductor digiti minimi of left hand', 'abductor digiti minimi of right hand'),
      },
      {
        label: 'M. FLEXOR DIGITI MINIMI',
        meshNames: m('flexor digiti minimi brevis of left hand', 'flexor digiti minimi brevis of right hand'),
      },
      {
        label: 'MUSCULUS INTEROSSEUS DORSALIS I',
        meshNames: m('set of dorsal interossei of left hand', 'set of dorsal interossei of right hand'),
      },
      {
        label: 'MUSCULUS INTEROSSEUS PALMARIS II',
        meshNames: m('set of palmar interossei of left hand', 'set of palmar interossei of right hand'),
      },
    ],
  },
  {
    heading: 'Alsó Végtag',
    entries: [
      {
        label: 'M. ILIOPSOAS',
        meshNames: m('left iliacus', 'right iliacus', 'left psoas major', 'right psoas major'),
      },
      {
        label: 'M. QUADRICEPS FEMORIS',
        meshNames: m(
          'left rectus femoris',
          'right rectus femoris',
          'left vastus intermedius',
          'right vastus intermedius',
          'left vastus lateralis',
          'right vastus lateralis',
          'left vastus medialis',
          'right vastus medialis',
        ),
      },
      {
        label: 'ADDUCTOROK',
        meshNames: m(
          'left adductor brevis',
          'right adductor brevis',
          'left adductor longus',
          'right adductor longus',
          'left adductor magnus',
          'right adductor magnus',
          'left adductor minimus',
          'right adductor minimus',
          'left gracilis',
          'right gracilis',
          'left pectineus',
          'right pectineus',
        ),
      },
      {
        label: 'M. GLUTEUS MEDIUS & MINIMUS',
        meshNames: m(
          'left gluteus medius',
          'right gluteus medius',
          'left gluteus minimus',
          'right gluteus minimus',
        ),
      },
      {
        label: 'M. GLUTEUS MAXIMUS',
        meshNames: m('left gluteus maximus', 'right gluteus maximus'),
      },
      {
        label: 'Comb hajlító izmai (Hamstring)',
        meshNames: m(
          'left semimembranosus',
          'right semimembranosus',
          'left semitendinosus',
          'right semitendinosus',
          'long head of left biceps femoris',
          'long head of right biceps femoris',
          'short head of left biceps femoris',
          'short head of right biceps femoris',
        ),
      },
      {
        label: 'M. GASTROCNEMIUS',
        meshNames: m(
          'lateral head of left gastrocnemius',
          'lateral head of right gastrocnemius',
          'medial head of left gastrocnemius',
          'medial head of right gastrocnemius',
        ),
      },
      {
        label: 'M. SOLEUS',
        meshNames: m('left soleus', 'right soleus'),
      },
      {
        label: 'M. TIBIALIS POSTERIOR',
        meshNames: m('left tibialis posterior', 'right tibialis posterior'),
      },
      {
        label: 'M. FLEXOR DIGITORUM LONGUS',
        meshNames: m('left flexor digitorum longus', 'right flexor digitorum longus'),
      },
      {
        label: 'FLEXOR HALLUCIS LONGUS',
        meshNames: m('left flexor hallucis longus', 'right flexor hallucis longus'),
      },
      {
        label: 'A láb kis izmai',
        meshNames: m(
          'abductor digiti minimi of left foot',
          'abductor digiti minimi of right foot',
          'first lumbrical of left foot',
          'first lumbrical of right foot',
          'second lumbrical of left foot',
          'second lumbrical of right foot',
          'third lumbrical of left foot',
          'third lumbrical of right foot',
          'fourth lumbrical of left foot',
          'fourth lumbrical of right foot',
          'first plantar interosseous of left foot',
          'first plantar interosseous of right foot',
          'second plantar interosseous of left foot',
          'second plantar interosseous of right foot',
          'third plantar interosseous of left foot',
          'third plantar interosseous of right foot',
          'flexor digiti minimi brevis of left foot',
          'flexor digiti minimi brevis of right foot',
        ),
      },
      {
        label: 'M. EXTENSOR DIGITORUM LONGUS',
        meshNames: m('left extensor digitorum longus', 'right extensor digitorum longus'),
      },
      {
        label: 'M. TIBIALIS ANTERIOR',
        meshNames: m('left tibialis anterior', 'right tibialis anterior'),
      },
      {
        label: 'M. EXTENSOR HALLUCIS LONGUS',
        meshNames: m('left extensor hallucis longus', 'right extensor hallucis longus'),
      },
      {
        label: 'M. EXTENSOR DIGITORUM BREVIS',
        meshNames: m('left extensor hallucis brevis', 'right extensor hallucis brevis'),
      },
      {
        label: 'M. PERONEUS LONGUS & BREVIS',
        meshNames: m(
          'left fibularis longus',
          'right fibularis longus',
          'left fibularis brevis',
          'right fibularis brevis',
          'left fibularis tertius',
          'right fibularis tertius',
        ),
      },
    ],
  },
];
