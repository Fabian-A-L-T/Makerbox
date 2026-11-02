import sql from "../config/database.js";
import type { ManufacturerData, ManufacturerFilterData, PaginationData } from "../utils/schemas.js";
import { NotFoundError } from "../utils/errors.js";

export default class Manufacturer {
    
    static async get({ limit, offset, search, orderBy, desc, exclude }: PaginationData & ManufacturerFilterData){
        return await sql`
            SELECT id, name, website FROM manufacturers
            WHERE name ILIKE ${'%' + (search ?? '') + '%'} AND deleted_at IS NULL
            ${exclude ? sql`AND id != ${exclude}` : sql``}
            ORDER BY ${sql(orderBy || 'id')} ${desc === 'true' ? sql`DESC` : sql`ASC`}
            LIMIT ${limit || 50} OFFSET ${offset || 0}`;
    }

    static async getById(id: number){
        const rows = await sql`
            SELECT id, name, website FROM manufacturers 
            WHERE id = ${id} AND deleted_at IS NULL`;
        if (!rows.length) throw new NotFoundError();
        return rows;
    }

    static async create(data: ManufacturerData){
        return await sql`
            INSERT INTO manufacturers ${sql(data)} 
            RETURNING id, name, website`;
    }

    static async update(id: number, data: ManufacturerData){
        const rows = await sql`
            UPDATE manufacturers SET ${sql(data)}, updated_at = now() 
            WHERE id = ${id} AND deleted_at IS NULL
            RETURNING id, name, website`;

        if (!rows.length) throw new NotFoundError();
        return rows;
    }

    static async delete(id: number){
        const rows = await sql`
            UPDATE manufacturers SET deleted_at = now(), updated_at = now() 
            WHERE id = ${id} AND deleted_at IS NULL
            RETURNING id, name, website`;
        if (!rows.length) throw new NotFoundError();
        return rows;
    }

    static async restore(id: number){
        const rows = await sql`
            UPDATE manufacturers SET deleted_at = NULL, updated_at = now() 
            WHERE id = ${id} AND deleted_at IS NOT NULL
            RETURNING id, name, website`;
        if (!rows.length) throw new NotFoundError();
        return rows;
    }
}
