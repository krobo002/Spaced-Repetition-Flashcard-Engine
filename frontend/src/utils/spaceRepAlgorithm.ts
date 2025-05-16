
// Based on SuperMemo SM-2 algorithm (simplified)
// Reference: https://en.wikipedia.org/wiki/SuperMemo#Algorithm_SM-2

export type ReviewQuality = 'again' | 'hard' | 'good' | 'easy';

export interface CardReviewData {
  easeFactor: number; // E-factor value (how easy the card is to remember)
  interval: number;   // Current interval in days
  repetitions: number; // Number of times the card has been successfully reviewed
  dueDate: Date;      // Next review date
  lastReviewed: Date; // When the card was last reviewed
}

// Convert the review quality to a numeric value
const reviewQualityToNumber = (quality: ReviewQuality): number => {
  switch (quality) {
    case 'again': return 0;
    case 'hard': return 3;
    case 'good': return 4;
    case 'easy': return 5;
    default: return 0;
  }
};

// Process a review and calculate new parameters
export const processReview = (
  prevData: CardReviewData | null,
  quality: ReviewQuality
): CardReviewData => {
  const now = new Date();
  
  // If this is the first review, initialize with default values
  if (!prevData) {
    const qualityNum = reviewQualityToNumber(quality);
    const daysToAdd = qualityNum <= 0 ? 0 : qualityNum === 3 ? 1 : qualityNum === 4 ? 3 : 5;
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysToAdd);
    
    return {
      easeFactor: 2.5, // Default ease factor
      interval: daysToAdd,
      repetitions: qualityNum > 0 ? 1 : 0,
      dueDate,
      lastReviewed: now
    };
  }
  
  // Convert the review quality to a numeric value (0-5)
  const qualityNum = reviewQualityToNumber(quality);
  
  let { easeFactor, interval, repetitions } = prevData;
  
  // If the user forgot the card (quality < 3), reset the repetition count
  if (qualityNum < 3) {
    repetitions = 0;
    interval = 0;
  } else {
    // Calculate the new interval based on repetitions
    if (repetitions === 0) {
      interval = 1; // First successful repetition: 1 day
    } else if (repetitions === 1) {
      interval = 6; // Second successful repetition: 6 days
    } else {
      // For subsequent successful repetitions, multiply by E-factor
      interval = Math.round(interval * easeFactor);
    }
    
    repetitions++;
    
    // Update ease factor based on quality
    // EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    easeFactor += 0.1 - (5 - qualityNum) * (0.08 + (5 - qualityNum) * 0.02);
    
    // Ensure ease factor doesn't go below 1.3
    if (easeFactor < 1.3) easeFactor = 1.3;
  }
  
  // Special case: if quality is "again", review again in 0-1 days
  if (quality === 'again') {
    interval = 0;
  } else if (quality === 'hard') {
    // For "hard" responses, use a shorter interval
    interval = Math.max(1, Math.floor(interval * 0.5));
  } else if (quality === 'easy') {
    // For "easy" responses, use a longer interval
    interval = Math.floor(interval * 1.3);
  }
  
  // Calculate the next due date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);
  
  return {
    easeFactor,
    interval,
    repetitions,
    dueDate,
    lastReviewed: now
  };
};

// Check if a card is due for review
export const isCardDue = (reviewData?: CardReviewData): boolean => {
  if (!reviewData) return true; // New cards are always due
  
  const now = new Date();
  return reviewData.dueDate <= now;
};

// Calculate days until a card is due
export const daysUntilDue = (reviewData?: CardReviewData): number => {
  if (!reviewData) return 0;
  
  const now = new Date();
  const dueDate = reviewData.dueDate;
  const diffTime = dueDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
