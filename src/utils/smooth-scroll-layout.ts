import { Photo } from "@/types/photo";

//LAYOUT
export const MIN_LAYOUT_SCROLL_HEIGHT = 10000;
export const MAIN_PHOTO_SECTION_SCROLL_HEIGHT = 1200;

export function getLayoutScrollHeight(
	animationItems: PhotoAnimation[]
): number {
	if (animationItems.length === 0) {
		return MIN_LAYOUT_SCROLL_HEIGHT;
	}
	const totalScrollSpan = animationItems.reduce(
		(sum, a) => sum + a.scrollSpan,
		0
	);
	const firstStartRatio = animationItems[0].startRatio;
	const minHeightFromAnimations =
		(MAIN_PHOTO_SECTION_SCROLL_HEIGHT + totalScrollSpan) /
		(1 - firstStartRatio);
	return Math.max(MIN_LAYOUT_SCROLL_HEIGHT, minHeightFromAnimations);
}

//ANIMATION PHOTOS
export const FIRST_CLIP_START = "polygon(20% 20%, 80% 10%, 90% 80%, 10% 80%)";
export const CLIP_START = "polygon(25% 25%, 75% 25%, 75% 75%, 25% 75%)";
export const CLIP_END = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

const ANIMATION_REVEAL_FROM = [
	"polygon(30% 20%, 70% 18%, 74% 80%, 26% 82%)",
	"polygon(22% 28%, 78% 20%, 82% 74%, 18% 82%)",
	"polygon(26% 22%, 74% 26%, 80% 78%, 20% 74%)",
	"polygon(18% 24%, 82% 24%, 78% 76%, 22% 76%)",
	"polygon(28% 18%, 72% 22%, 76% 82%, 24% 78%)",
];

const ANIMATION_REVEAL_TO = [
	"polygon(6% 4%, 94% 2%, 96% 96%, 4% 98%)",
	"polygon(2% 8%, 98% 2%, 96% 92%, 4% 98%)",
	"polygon(8% 2%, 92% 8%, 98% 98%, 2% 92%)",
	"polygon(4% 4%, 96% 4%, 92% 96%, 8% 96%)",
	"polygon(6% 2%, 94% 6%, 98% 94%, 2% 98%)",
];

const ANIMATION_SCHEDULE = [
	{
		startRatio: 0.03,
		scrollSpan: 1080,
		entryPortion: 0.34,
		holdPortion: 0.16,
		exitPortion: 0.5,
	},
	{
		startRatio: 0.08,
		scrollSpan: 1540,
		entryPortion: 0.32,
		holdPortion: 0.32,
		exitPortion: 0.36,
	},
	{
		startRatio: 0.23,
		scrollSpan: 1500,
		entryPortion: 0.31,
		holdPortion: 0.34,
		exitPortion: 0.35,
	},
	{
		startRatio: 0.3,
		scrollSpan: 1620,
		entryPortion: 0.3,
		holdPortion: 0.35,
		exitPortion: 0.35,
	},
	{
		startRatio: 0.38,
		scrollSpan: 1680,
		entryPortion: 0.29,
		holdPortion: 0.37,
		exitPortion: 0.34,
	},
	{
		startRatio: 0.46,
		scrollSpan: 1620,
		entryPortion: 0.29,
		holdPortion: 0.37,
		exitPortion: 0.34,
	},
	{
		startRatio: 0.55,
		scrollSpan: 1760,
		entryPortion: 0.27,
		holdPortion: 0.4,
		exitPortion: 0.33,
	},
	{
		startRatio: 0.63,
		scrollSpan: 1960,
		entryPortion: 0.26,
		holdPortion: 0.42,
		exitPortion: 0.32,
	},
];

export interface PhotoAnimation {
	photo: Photo;
	layoutIndex: number;
	revealFrom: string;
	revealTo: string;
	startScale: number;
	holdScale: number;
	endScale: number;
	scrubOffset: number;
	startRatio: number;
	scrollSpan: number;
	entryPortion: number;
	holdPortion: number;
	exitPortion: number;
}

export function buildPhotosAnimations(photos: Photo[]): PhotoAnimation[] {
	return photos.map((photo, index) => ({
		...ANIMATION_SCHEDULE[index % ANIMATION_SCHEDULE.length],
		photo,
		layoutIndex: index % 5,
		revealFrom: ANIMATION_REVEAL_FROM[index % ANIMATION_REVEAL_FROM.length],
		revealTo: ANIMATION_REVEAL_TO[index % ANIMATION_REVEAL_TO.length],
		startScale: 1.22 - (index % 3) * 0.04,
		holdScale: 1 + (index % 2) * 0.02,
		endScale: 0.94 + (index % 2) * 0.03,
		scrubOffset: 0.2 + index * 0.13,
	}));
}
