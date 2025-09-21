import { role } from "../../../drizzle/schema";
import { db } from "../../config/drizzle";

export class RoleService {
    static async getRoles() {
        const roles = await db.select({
            id: role.id,
            name: role.name
        }).from(role);
        
        return roles;
    }
}