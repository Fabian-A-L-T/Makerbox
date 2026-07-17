import sql from "../config/database.js";
import type { LocationData, LocationFilterData, PaginationData } from "../utils/schemas.js";
import { NotFoundError } from "../utils/errors.js";

export default class Location {

    static async get({ search, limit, offset, orderBy, desc, exclude}: PaginationData & LocationFilterData){
        return await sql`
            SELECT * FROM locations
            WHERE name ILIKE ${'%' + (search ?? '') + '%'} AND deleted_at IS NULL
            ${exclude ? sql`AND id != ${exclude}` : sql``}
            ORDER BY ${sql(orderBy || 'path')} ${desc === 'true' ? sql`DESC` : sql`ASC`}
            LIMIT ${limit || 50} OFFSET ${offset || 0}`;
    }
    
    static async getById(id: number){
        const rows = await sql`
            SELECT * FROM locations 
            WHERE id = ${id} AND deleted_at IS NULL`;
        if (!rows.length) throw new NotFoundError();
        return rows;
    }

    static async create(data: LocationData) {
        return await sql`
            INSERT INTO locations ${sql(data)} 
            RETURNING *`;
    }

    static async update(id: number, data: LocationData) {
        const rows = await sql`
            UPDATE locations SET ${sql(data)}, updated_at = now()
            WHERE id = ${id} 
            RETURNING OLD.path as old_path, *`;

        if(rows && data.path) {
            await sql`
                UPDATE locations
                SET path = ${data.path} || subpath(path,nlevel(${rows[0].old_path})), updated_at = now() 
                where path ~ ${`${rows[0].old_path}.*{1,}`}`;
        }
        if (!rows.length) throw new NotFoundError();
        return rows;
    }

    static async delete(id: number) {
        const rows = await sql`
            UPDATE locations SET deleted_at = now(), updated_at = now() 
            WHERE id = ${id} AND deleted_at IS NULL
            RETURNING *`;
        if(rows) {
            await sql`
                UPDATE locations
                SET deleted_at = now(), updated_at = now() 
                where path ~ ${`${rows[0].path}.*{1,}`}`;
        }
        if (!rows.length) throw new NotFoundError();
        return rows;
    }

    static async getComponents(location_id: number) {
        return await sql`
            SELECT cu.*, c.sku, c.name AS component_name
            FROM component_location cu
            JOIN components c ON cu.component_id = c.id
            WHERE cu.location_id = ${location_id}`;
    }
}
