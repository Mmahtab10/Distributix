export interface Ticket {
	id: string;
	name: string;
	description: string;
	price: number;
	date: string;
	locationName: string;
	coordinates: Coordinates;
	quantity: number;
}

export type Coordinates = [latitude, longitude];

type latitude = number;
type longitude = number;
