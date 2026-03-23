export interface ICreateHousePayload {
  name: string;
  description?: string;
}

export interface IUpdateHousePayload {
  name?: string;
  description?: string | null;
}
