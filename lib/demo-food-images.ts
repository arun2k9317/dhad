/**
 * Demo food imagery — South Indian / Indian cuisine via Pexels (stable hotlinks for Expo).
 */
const q = "auto=compress&cs=tinysrgb&w=900";

function pexels(id: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?${q}`;
}

export const DEMO_POST_FALLBACK_IMAGE = pexels(6210876);

export const DEMO_MEETUP_COVER_ROTATION = [
  pexels(9585450),
  pexels(12737656),
  pexels(6127522),
] as const;
