/**
 * Demo-only: map a free-text location label to coordinates when we have no geocoder.
 * Falls back to Kochi (Kerala) — demo anchor when GPS is off or label is unknown.
 */
export const DEMO_FALLBACK_COORDS = {
  latitude: 9.9312,
  longitude: 76.2673,
} as const;

type Rule = { test: RegExp; latitude: number; longitude: number };

/** Approximate town centres across Kerala for keyword matching. */
const RULES: Rule[] = [
  { test: /munnar|idukki/i, latitude: 10.0889, longitude: 77.0595 },
  { test: /wayanad|kalpetta|sulthan bathery/i, latitude: 11.6854, longitude: 76.132 },
  { test: /kozhikode|calicut|mittai theruvu|beypore/i, latitude: 11.2588, longitude: 75.7804 },
  { test: /thrissur|trichur|swaraj round/i, latitude: 10.5276, longitude: 76.2144 },
  {
    test: /thiruvananthapuram|trivandrum|kovalam|vazhuthacaud|kowdiar/i,
    latitude: 8.5241,
    longitude: 76.9366,
  },
  { test: /alappuzha|alleppey|backwater|marari/i, latitude: 9.4981, longitude: 76.3388 },
  {
    test: /palakkad|palghat|malampuzha/i,
    latitude: 10.7867,
    longitude: 76.6548,
  },
  {
    test: /kochi|ernakulam|fort kochi|mattancherry|edappally|kakkanad|mg road|lulu mall/i,
    latitude: 9.9312,
    longitude: 76.2673,
  },
  { test: /kerala|god'?s own country/i, latitude: 9.9312, longitude: 76.2673 },
];

export function resolveDemoCoordsForLocationLabel(label: string): {
  latitude: number;
  longitude: number;
} {
  const s = label.trim();
  if (!s || s.toLowerCase() === "unknown") {
    return { ...DEMO_FALLBACK_COORDS };
  }
  for (const r of RULES) {
    if (r.test.test(s)) {
      return { latitude: r.latitude, longitude: r.longitude };
    }
  }
  return { ...DEMO_FALLBACK_COORDS };
}
