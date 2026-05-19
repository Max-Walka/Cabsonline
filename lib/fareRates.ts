// Approximate centre coordinates [lat, lng] for every Auckland suburb
const SUBURB_COORDS: Record<string, [number, number]> = {
  'airport oaks':           [-37.009, 174.786],
  'albany':                 [-36.727, 174.701],
  'alfriston':              [-37.030, 174.884],
  'arch hill':              [-36.862, 174.744],
  'auckland city centre':   [-36.848, 174.763],
  'avondale':               [-36.892, 174.699],
  'balmoral':               [-36.878, 174.754],
  'bayswater':              [-36.812, 174.785],
  'bayview':                [-36.762, 174.718],
  'beach haven':            [-36.802, 174.713],
  'belmont':                [-36.806, 174.769],
  'birkdale':               [-36.808, 174.720],
  'birkenhead':             [-36.820, 174.746],
  'blockhouse bay':         [-36.924, 174.726],
  'botany':                 [-36.921, 174.913],
  'botany downs':           [-36.928, 174.913],
  'browns bay':             [-36.717, 174.750],
  'bucklands beach':        [-36.894, 174.938],
  'burswood':               [-36.903, 174.920],
  'campbells bay':          [-36.734, 174.749],
  'castor bay':             [-36.750, 174.757],
  'chatswood':              [-36.795, 174.730],
  'clendon park':           [-37.014, 174.895],
  'clover park':            [-36.981, 174.887],
  'cockle bay':             [-36.898, 174.948],
  'conifer grove':          [-37.023, 174.897],
  'dannemora':              [-36.926, 174.920],
  'devonport':              [-36.828, 174.800],
  'drury':                  [-37.097, 174.953],
  'east tāmaki':            [-36.946, 174.900],
  'east tāmaki heights':    [-36.952, 174.903],
  'eastern beach':          [-36.897, 174.951],
  'eden terrace':           [-36.862, 174.754],
  'ellerslie':              [-36.903, 174.810],
  'epsom':                  [-36.888, 174.768],
  'fairview heights':       [-36.738, 174.703],
  'farm cove':              [-36.897, 174.928],
  'favona':                 [-36.964, 174.805],
  'flat bush':              [-36.956, 174.907],
  'forrest hill':           [-36.757, 174.740],
  'freemans bay':           [-36.854, 174.749],
  'glendene':               [-36.894, 174.664],
  'glendowie':              [-36.868, 174.847],
  'glen eden':              [-36.912, 174.650],
  'glenfield':              [-36.780, 174.730],
  'glen innes':             [-36.878, 174.836],
  'golflands':              [-36.916, 174.921],
  'goodwood heights':       [-36.990, 174.867],
  'grafton':                [-36.860, 174.771],
  'green bay':              [-36.930, 174.710],
  'greenlane':              [-36.889, 174.783],
  'greenhithe':             [-36.757, 174.680],
  'grey lynn':              [-36.862, 174.737],
  'half moon bay':          [-36.895, 174.942],
  'hauraki':                [-36.794, 174.775],
  'henderson':              [-36.895, 174.632],
  'henderson valley':       [-36.905, 174.620],
  'herald island':          [-36.803, 174.633],
  'herne bay':              [-36.851, 174.736],
  'highbrook':              [-36.944, 174.893],
  'highland park':          [-36.909, 174.920],
  'hillcrest':              [-36.798, 174.748],
  'hillpark':               [-36.988, 174.864],
  'hillsborough':           [-36.909, 174.752],
  'hingaia':                [-37.073, 174.963],
  'hobsonville':            [-36.797, 174.651],
  'homai':                  [-37.003, 174.895],
  'howick':                 [-36.898, 174.935],
  'huntington park':        [-36.992, 174.869],
  'kaurilands':             [-36.937, 174.650],
  'kelston':                [-36.895, 174.673],
  'kingsland':              [-36.875, 174.742],
  'kohimarama':             [-36.867, 174.818],
  'konini':                 [-36.933, 174.643],
  'laingholm':              [-36.952, 174.655],
  'lincoln':                [-36.892, 174.665],
  'long bay':               [-36.690, 174.750],
  'lynfield':               [-36.923, 174.742],
  'mairangi bay':           [-36.738, 174.754],
  'māngere':                [-36.972, 174.798],
  'māngere bridge':         [-36.944, 174.791],
  'māngere east':           [-36.975, 174.811],
  'manukau central':        [-36.993, 174.878],
  'manurewa':               [-37.000, 174.888],
  'massey':                 [-36.884, 174.614],
  'mclaren park':           [-36.900, 174.656],
  'meadowbank':             [-36.878, 174.800],
  'mellons bay':            [-36.906, 174.950],
  'middlemore':             [-36.958, 174.851],
  'milford':                [-36.777, 174.766],
  'mission bay':            [-36.862, 174.825],
  'mission heights':        [-36.953, 174.907],
  'morningside':            [-36.875, 174.737],
  'mount albert':           [-36.887, 174.730],
  'mount eden':             [-36.877, 174.758],
  'mount roskill':          [-36.907, 174.746],
  'mount wellington':       [-36.899, 174.815],
  'murrays bay':            [-36.728, 174.753],
  'narrow neck':            [-36.817, 174.793],
  'new lynn':               [-36.906, 174.686],
  'newmarket':              [-36.870, 174.777],
  'newton':                 [-36.858, 174.754],
  'new windsor':            [-36.899, 174.722],
  'northcote':              [-36.815, 174.755],
  'northcross':             [-36.723, 174.733],
  'northpark':              [-36.726, 174.742],
  'onehunga':               [-36.920, 174.784],
  'one tree hill':          [-36.893, 174.773],
  'ōpaheke':                [-37.060, 174.968],
  'ōrākei':                 [-36.862, 174.808],
  'oranga':                 [-36.911, 174.787],
  'oratia':                 [-36.906, 174.608],
  'ōtāhuhu':                [-36.937, 174.836],
  'ōtara':                  [-36.953, 174.874],
  'oteha':                  [-36.716, 174.715],
  'ōwairaka':               [-36.893, 174.727],
  'pahurehure':             [-37.060, 174.965],
  'pakuranga':              [-36.893, 174.902],
  'pakuranga heights':      [-36.899, 174.895],
  'panmure':                [-36.893, 174.848],
  'papakura':               [-37.065, 174.944],
  'papatoetoe':             [-36.975, 174.855],
  'parnell':                [-36.858, 174.777],
  'penrose':                [-36.909, 174.802],
  'pinehill':               [-36.720, 174.718],
  'point chevalier':        [-36.868, 174.727],
  'point england':          [-36.885, 174.843],
  'ponsonby':               [-36.854, 174.743],
  'randwick park':          [-37.009, 174.893],
  'rānui':                  [-36.895, 174.617],
  'red hill':               [-37.072, 174.955],
  'remuera':                [-36.879, 174.793],
  'rosebank':               [-36.888, 174.694],
  'rosedale':               [-36.745, 174.726],
  'rosehill':               [-37.068, 174.958],
  'rothesay bay':           [-36.720, 174.752],
  'royal heights':          [-36.869, 174.601],
  'royal oak':              [-36.895, 174.764],
  'saint heliers':          [-36.871, 174.839],
  'saint marys bay':        [-36.848, 174.742],
  'sandringham':            [-36.880, 174.748],
  'schnapper rock':         [-36.737, 174.699],
  'shamrock park':          [-36.907, 174.950],
  'shelly park':            [-36.903, 174.946],
  'somerville':             [-36.903, 174.943],
  'southdown':              [-36.916, 174.793],
  'stanley point':          [-36.817, 174.807],
  'st johns':               [-36.878, 174.808],
  'st lukes':               [-36.875, 174.735],
  'stonefields':            [-36.885, 174.808],
  'sunnyhills':             [-36.902, 174.912],
  'sunnynook':              [-36.762, 174.736],
  'sunnyvale':              [-36.910, 174.642],
  'swanson':                [-36.882, 174.561],
  'takanini':               [-37.046, 174.924],
  'takapuna':               [-36.787, 174.774],
  'tāmaki':                 [-36.887, 174.840],
  'te atatū peninsula':     [-36.866, 174.642],
  'te atatū south':         [-36.876, 174.651],
  'te papapa':              [-36.912, 174.792],
  'the gardens':            [-36.982, 174.881],
  'three kings':            [-36.896, 174.764],
  'titirangi':              [-36.938, 174.657],
  'torbay':                 [-36.701, 174.748],
  'totara heights':         [-36.991, 174.872],
  'tōtara vale':            [-36.752, 174.703],
  'unsworth heights':       [-36.755, 174.726],
  'waiake':                 [-36.696, 174.752],
  'waikōwhai':              [-36.918, 174.762],
  'waima':                  [-36.888, 174.554],
  'wai o taiki bay':        [-36.868, 174.812],
  'wairau valley':          [-36.782, 174.741],
  'waterview':              [-36.889, 174.715],
  'wattle downs':           [-37.011, 174.896],
  'wesley':                 [-36.919, 174.741],
  'western heights':        [-36.898, 174.611],
  'western springs':        [-36.871, 174.727],
  'westfield':              [-36.915, 174.800],
  'westgate':               [-36.826, 174.622],
  'west harbour':           [-36.878, 174.607],
  'westmere':               [-36.864, 174.726],
  'weymouth':               [-37.018, 174.858],
  'whenuapai':              [-36.795, 174.636],
  'windsor park':           [-36.728, 174.742],
  'wiri':                   [-36.987, 174.836],
  'woodlands park':         [-36.943, 174.638],
}

// Common alternate names/abbreviations → canonical key
const ALIASES: Record<string, string> = {
  'auckland cbd':        'auckland city centre',
  'cbd':                 'auckland city centre',
  'city':                'auckland city centre',
  'city centre':         'auckland city centre',
  'auckland central':    'auckland city centre',
  'central auckland':    'auckland city centre',
  'mt eden':             'mount eden',
  'mt albert':           'mount albert',
  'mt roskill':          'mount roskill',
  'mt wellington':       'mount wellington',
  'st heliers':          'saint heliers',
  'st marys bay':        'saint marys bay',
  'mangere':             'māngere',
  'mangere bridge':      'māngere bridge',
  'mangere east':        'māngere east',
  'tamaki':              'tāmaki',
  'east tamaki':         'east tāmaki',
  'east tamaki heights': 'east tāmaki heights',
  'otahuhu':             'ōtāhuhu',
  'otara':               'ōtara',
  'owairaka':            'ōwairaka',
  'orakei':              'ōrākei',
  'ranui':               'rānui',
  'waikowhai':           'waikōwhai',
  'opaheke':             'ōpaheke',
  'totara vale':         'tōtara vale',
  'te atatu peninsula':  'te atatū peninsula',
  'te atatu south':      'te atatū south',
}

function resolveSuburb(input: string): string | null {
  const key = input.toLowerCase().trim()
  if (SUBURB_COORDS[key]) return key
  if (ALIASES[key]) return ALIASES[key]
  return null
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export interface FareResult {
  estimated_fare: number
  distance_km: number
  from: string
  to: string
}

export interface FareError {
  error: true
  message: string
}

export function getFare(from: string, to: string): FareResult | FareError {
  const fromKey = resolveSuburb(from)
  const toKey = resolveSuburb(to)

  if (!fromKey) return { error: true, message: `"${from}" is not a recognised Auckland suburb` }
  if (!toKey) return { error: true, message: `"${to}" is not a recognised Auckland suburb` }

  const [lat1, lng1] = SUBURB_COORDS[fromKey]
  const [lat2, lng2] = SUBURB_COORDS[toKey]

  const straightLineKm = haversineKm(lat1, lng1, lat2, lng2)
  // Road distance is roughly 35% longer than straight line; minimum 2 km
  const roadKm = Math.max(straightLineKm * 1.35, 2)
  // Auckland taxi rates: $3.50 flag fall + $2.80/km, minimum $8.50, rounded to nearest $0.50
  const raw = 3.50 + roadKm * 2.80
  const estimated_fare = Math.max(Math.round(raw / 0.5) * 0.5, 8.50)

  return {
    estimated_fare,
    distance_km: Math.round(roadKm * 10) / 10,
    from: fromKey.replace(/\b\w/g, (c) => c.toUpperCase()),
    to: toKey.replace(/\b\w/g, (c) => c.toUpperCase()),
  }
}

export function isValidSuburb(name: string): boolean {
  return resolveSuburb(name) !== null
}

export function getSuburbs(): string[] {
  return Object.keys(SUBURB_COORDS)
    .map((s) => s.replace(/\b\w/g, (c) => c.toUpperCase()))
    .sort()
}
