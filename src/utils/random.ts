/**
 * Generates a deterministic pseudo-random number based on a seed.
 * Useful for SSR consistency where Math.random() would produce different results on server and client.
 *
 * @param seed - A numeric seed value
 * @returns A pseudo-random number between 0 and 1
 */
export function seededRandom(seed: number): number {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}
