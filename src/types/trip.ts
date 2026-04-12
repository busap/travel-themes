import { Country } from "@/enums/country";
import { Photo } from "./photo";

export interface Trip {
	id: string;
	name: string;
	countries: Country[];
	year: number;
	description: string;
	coverPhoto: string;
	photos: Photo[];
}
