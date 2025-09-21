import { role } from "../../../drizzle/schema";
import { db } from "../../config/drizzle";

export class RoleService {
    static async getRoles() {
        const roles = await db.select().from(role);
        return roles;
    }
}