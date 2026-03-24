export interface ICreateDepositPayload {
  houseId: string;
  monthId: string;
  amount: number;
  note?: string;
}

export interface IUpdateDepositPayload {
  amount?: number;
  note?: string;
}
