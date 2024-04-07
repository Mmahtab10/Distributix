export interface Ticket {
	confirmation_ids: string;
	coordinates: Coordinates;
	date: string;
	description: string;
	eventName: string;
	location: string;
	price: string;
	quantity: number;
	ticket_id: number;
}

export type Coordinates = [latitude, longitude];

type latitude = number;
type longitude = number;
