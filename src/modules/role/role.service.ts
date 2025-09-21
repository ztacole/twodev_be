import { role } from "../../../drizzle/schema";
import { db } from "../../config/drizzle";

export class RoleService {
    static async getRoles(): Promise<any[]> {
        const roles = await db.query.role.findMany();

        return roles;
    }
}