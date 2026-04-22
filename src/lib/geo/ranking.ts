/**
 * Hybrid ranking system: Prioritizes Trust (Rating + reviews) over Distance.
 * Formula provided by the user:
 * Score = (0.5 * Rating Score) + (0.3 * Review Volume Score) + (0.2 * Distance Score)
 */

export type RankingMode = "nearest" | "recommended";

/** 
 * Normalizes rating 1-5 to 0-1
 */
export function ratingScore(rating: number): number {
  return Math.max(0, Math.min(1, rating / 5));
}

/**
 * Normalizes review volume. 
 * We use log scale or saturation curve so 10 reviews vs 1 review is a big jump, 
 * but 500 reviews vs 490 reviews is a small jump.
 */
export function reviewVolumeScore(reviews: number): number {
  return Math.min(1, reviews / (reviews + 20)); // Saturaes at ~100+ reviews
}

/**
 * Normalizes distance. Closer = 1, far = 0.
 */
export function distanceScoreFromKm(distanceKm: number): number {
  return 1 / (1 + Math.max(0, distanceKm));
}

export function hybridWeights(params: {
  mode: RankingMode;
}): { wRating: number; wReviews: number; wDistance: number } {
  if (params.mode === "nearest") {
    return { wRating: 0, wReviews: 0, wDistance: 1 };
  }
  // User weights: 0.5 Rating, 0.3 Reviews, 0.2 Distance
  return { wRating: 0.5, wReviews: 0.3, wDistance: 0.2 };
}

export function calculateHybridScore(
  rating: number,
  reviews: number,
  distanceKm: number,
  mode: RankingMode = "recommended"
): number {
  const { wRating, wReviews, wDistance } = hybridWeights({ mode });
  
  const sRating = ratingScore(rating);
  const sReviews = reviewVolumeScore(reviews);
  const sDist = distanceScoreFromKm(distanceKm);
  
  return (wRating * sRating) + (wReviews * sReviews) + (wDistance * sDist);
}
