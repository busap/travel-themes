import { Country } from "@/enums/country";
import { Theme } from "@/enums/theme";

export const tripsData = [
	{
		id: "2021-germany",
		name: "Cologne Detour",
		countries: [Country.DE],
		year: 2021,
		description:
			"Cologne's cathedral and quiet roads through the countryside",
		theme: Theme.GridHover,
	},
	{
		id: "2021-netherlands",
		name: "Amsterdam Getaway",
		countries: [Country.NL],
		year: 2021,
		description: "Canals, bikes, and golden hour at the Museumplein",
		theme: Theme.PhotoCarousel,
	},
	{
		id: "2021-barcelona",
		name: "Barcelona Weekend Trip",
		countries: [Country.ES],
		year: 2021,
		description: "Sun, tapas, and Gaudí around every corner",
		theme: Theme.Mosaic,
	},
	{
		id: "2021-iceland",
		name: "Iceland Road Trip",
		countries: [Country.IS],
		year: 2021,
		description: "Chasing waterfalls, geysers, and the northern lights",
		theme: Theme.Aurora,
	},
	{
		id: "2022-tml",
		name: "Tomorrowland 2022",
		countries: [Country.BE],
		year: 2022,
		description: "Bass drops, fairy tales, and a world made of pure magic",
		theme: Theme.Trippy,
	},
	{
		id: "2022-ireland",
		name: "Ireland Road Trip",
		countries: [Country.IE],
		year: 2022,
		description:
			"Pints of Guinness, Westeros filming locations, and cliffs at the edge of the world",
		theme: Theme.Parallax,
	},
	{
		id: "2023-jordan",
		name: "Jordan Desert Trail",
		countries: [Country.JO],
		year: 2023,
		description:
			"Ancient ruins, Bedouin fires, and the silence of Wadi Rum",
		theme: Theme.Trail,
	},
	{
		id: "2023-israel",
		name: "Israel Wandering",
		countries: [Country.IL],
		year: 2023,
		description: "Holy cities, hummus, and Mediterranean sunsets",
		theme: Theme.ImageGridHero,
	},
	{
		id: "2023-rome",
		name: "Roman Holiday",
		countries: [Country.IT],
		year: 2023,
		description: "Pizza, espresso, Vatican, and years of history",
		theme: Theme.SmoothScroll,
	},
	{
		id: "2023-andalucia",
		name: "Andalucía in Summer",
		countries: [Country.ES],
		year: 2023,
		description:
			"From Málaga's beaches to Córdoba's mezquita, Sevilla's flamenco and sangria at sunset",
		theme: Theme.Drift,
	},
	{
		id: "2023-dubai",
		name: "Dubai Stopover",
		countries: [Country.AE],
		year: 2023,
		description:
			"Towers of glass, golden deserts, and the hidden city beneath the glitter",
		theme: Theme.Showcase,
	},
	{
		id: "2023-thailand",
		name: "A Month in Thailand",
		countries: [Country.TH],
		year: 2023,
		description:
			"Bangkok chaos, lots of curry, many temples, weeks on the islands and a sawasdee ka at every turn",
		theme: Theme.Collage,
	},
];
