import sql from "../config/database.js";
import { userShow, type PaginationData, type FilterData, type UserData } from "../utils/schemas.js";
import { NotFoundError, UserNotFoundError } from "../utils/errors.js";
import bcrypt from "bcrypt";

export default class User {
    static async get({ search, limit, offset, orderBy, desc }: PaginationData & FilterData){
        return await sql`
            SELECT ${sql(userShow)} FROM users
            WHERE name ILIKE ${'%' + (search ?? '') + '%'} AND deleted_at IS NULL
            ORDER BY ${sql(orderBy || 'id')} ${desc === 'true' ? sql`DESC` : sql`ASC`}
            LIMIT ${limit || 50} OFFSET ${offset || 0}`;
    }

    static async getById(id: number){
        const rows = await sql`
            SELECT ${sql(userShow)}
            FROM users
            WHERE id = ${id} AND deleted_at IS NULL`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }
    
    static async create(data: UserData) {
        return await sql`
            INSERT INTO users ${sql(data)}
            RETURNING ${sql(userShow)}`;
    }

    static async updateRole(id: number, data: string) {
        const rows = await sql`
            UPDATE users SET role = ${data}
            WHERE id = ${id} AND deleted_at IS NULL
            RETURNING ${sql(userShow)}`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async updateName(id: number, name: string) {
        const rows = await sql`
            UPDATE users SET name = ${name}
            WHERE id = ${id} AND deleted_at IS NULL
            RETURNING ${sql(userShow)}`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async updateEmail(id: number, email: string) {
        const rows = await sql`
            UPDATE users SET email = ${email}
            WHERE id = ${id} AND deleted_at IS NULL
            RETURNING ${sql(userShow)}`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async updatePasswd(id: number, passwd: string) {
        const rows = await sql`
            UPDATE users SET passwd = ${passwd}
            WHERE id = ${id} AND deleted_at IS NULL
            RETURNING ${sql(userShow)}`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async restore(id: number) {
        const rows = await sql`
            UPDATE users SET deleted_at = null, updated_at = now() 
            WHERE id = ${id} AND deleted_at IS NOT NULL
            RETURNING ${sql(userShow)}`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async delete(id: number) {
        const rows = await sql`
            UPDATE users SET deleted_at = now(), updated_at = now() 
            WHERE id = ${id} AND deleted_at IS NULL
            RETURNING ${sql(userShow)}`;
        
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async login(email: string) {
        const rows = await sql`
            SELECT id, name, email, role, passwd
            FROM users
            WHERE email = ${email} AND deleted_at IS NULL`;
        if(!rows.length) throw new UserNotFoundError();
        return rows;
    }

    static async exists(email: string) {
        const rows = await sql`
            SELECT id, passwd
            FROM users
            WHERE email = ${email} AND deleted_at IS NULL`;
        if(!rows.length) return false;
        return true;
    }

    static async hasEqualPasswd(id: number, passwd: string) {
        const rows = await sql`
            SELECT id, passwd
            FROM users
            WHERE id = ${id} AND deleted_at IS NULL`;
        if(!rows.length) throw new UserNotFoundError();
        return bcrypt.compareSync(passwd, rows[0].passwd);
    }
}
