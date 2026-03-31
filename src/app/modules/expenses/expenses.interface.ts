import { ExpenseTypeEnum } from "../../../generated/prisma/enums";

export interface ICreateExpensePayload {
  houseId: string;
  monthId: string;
  type: ExpenseTypeEnum;
  amount: number;
  description?: string;
  userId?: string;
}

export interface IUpdateExpensePayload {
  type?: ExpenseTypeEnum;
  amount?: number;
  description?: string;
}
