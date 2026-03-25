export interface ICreatePlanPayload {
	name: string;
	price: number;
	durationDays: number;
	features: string[];
}

export interface IUpdatePlanPayload {
	name?: string;
	price?: number;
	durationDays?: number;
	features?: string[];
}

