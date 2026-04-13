import { Country } from "@/enums/country";

const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

export function getCountryName(code: Country): string {
	return displayNames.of(code) ?? code;
}

export function getCountryNames(codes: Country[], separator = ", "): string {
	return codes.map(getCountryName).join(separator);
}
