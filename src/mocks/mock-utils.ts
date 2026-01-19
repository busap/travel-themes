/**
 * Utility to pick a random item from an array
 */
export const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Utility to pick multiple random items from an array
 */
export const pickMultiple = <T,>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
};

/**
 * Generate a random number between min and max (inclusive)
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate a random boolean with optional probability
 * @param probability Probability of returning true (0-1), defaults to 0.5
 */
export const randomBoolean = (probability: number = 0.5): boolean => {
  return Math.random() < probability;
};
