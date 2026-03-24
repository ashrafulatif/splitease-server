import { UserRole } from "../../../generated/prisma/enums";

export interface IAddMemberToHousePayload {
	houseId: string;
	name: string;
	email: string;
	role?: UserRole;
}
