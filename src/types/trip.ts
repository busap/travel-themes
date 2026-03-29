import { Photo } from "./photo";

export interface Trip {
	id: string;
	name: string;
	countries: string[];
	year?: number;
	description?: string;
	coverPhoto: string;
	photos: Photo[];
}
