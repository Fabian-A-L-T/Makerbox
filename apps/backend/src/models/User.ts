import sql from "../config/database.js";
import { safeParse, number } from "valibot";
import { UserCreate, type UserCreateData, UserUpdate, type UserUpdateData, userShow, UserEmail, type UserEmailData, UserPassword, type UserPasswordData } from "./schemas.js";
import { ValidationError, NotFoundError } from "../errors.js";

class User {

    static async get(id?: number){
        if(id){
            const validatedId = safeParse(number(), id);
            if(!validatedId.success) throw new ValidationError();

            const rows = await sql`
                SELECT ${sql(userShow)}
                FROM users
                WHERE id = ${validatedId.output} AND deleted_at IS NULL`;

            if(!rows.length) throw new NotFoundError();
            return rows[0];
        }
        else{
            const rows = await sql`
                SELECT ${sql(userShow)}
                FROM users
                WHERE deleted_at IS NULL`;
            return rows;
        }
    }
    
    static async create(data: UserCreateData) {
        try {
            const validatedData = safeParse(UserCreate, data);
            if(!validatedData.success) throw new ValidationError();

            const rows = await sql`
                INSERT INTO users ${sql(validatedData.output)}
                RETURNING ${sql(userShow)}`;

            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async update(id: number, data: UserUpdateData) {
        try {
            const validatedId = safeParse(number(), id);
            if(!validatedId.success) throw new ValidationError();
            
            const validatedData = safeParse(UserUpdate, data);
            if(!validatedData.success) throw new ValidationError();
            
            const rows = await sql`
                UPDATE users SET ${sql(validatedData.output)}
                WHERE id = ${validatedId.output} AND deleted_at IS NULL
                RETURNING ${sql(userShow)}`;
            
            if(!rows.length) throw new NotFoundError();
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async restore(id: number) {
        try {
            const validatedId = safeParse(number(), id);
            if(!validatedId.success) throw new ValidationError();
            
            const rows = await sql`
                UPDATE users SET deleted_at = null, updated_at = now() 
                WHERE id = ${validatedId.output} AND deleted_at IS NOT NULL
                RETURNING ${sql(userShow)}`;

            if(!rows.length) throw new NotFoundError();
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async delete(id: number) {
        try {
            const validatedId = safeParse(number(), id);
            if(!validatedId.success) throw new ValidationError();
            
            const rows = await sql`
                UPDATE users SET deleted_at = now(), updated_at = now() 
                WHERE id = ${validatedId.output} deleted_at IS NULL
                RETURNING ${sql(userShow)}`;
            
            if(!rows.length) throw new NotFoundError();
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async login(email: UserEmailData) {
        try {
            const validatedEmail = safeParse(UserEmail, email);
            if(!validatedEmail.success) throw new ValidationError();
            
            const rows = await sql`
                SELECT id, name, email, role, passwd
                FROM users
                WHERE email = ${validatedEmail.output} AND deleted_at IS NULL`;

            if(!rows.length) throw new NotFoundError();
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async exists(email: UserEmailData) {
        try {
            const validatedEmail = safeParse(UserEmail, email);
            if(!validatedEmail.success) throw new ValidationError();

            const rows = await sql`
                SELECT id
                FROM users
                WHERE email = ${validatedEmail.output} AND deleted_at IS NULL`;

            if(!rows.length) return false;
            return true;
        } catch (error) {
            throw error;
        }
    }
}
export default User;