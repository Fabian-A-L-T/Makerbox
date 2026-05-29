import sql from "../config/database.js";
import { safeParse, number } from "valibot";
import { locationCreate, LocationCreateData, locationShow } from "../models/schemas.js";
import { NotFoundError, ValidationError } from "../errors.js";
import * as v from 'valibot';

const sortableColumns = ['id', 'name'];
const locationQuerySchema = v.object({
    id: v.optional(v.number()),
    search: v.optional(v.string()),
    limit: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(1), v.maxValue(100))),
    offset: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(0))),
    orderBy: v.optional(v.picklist(sortableColumns)),
    orderDir: v.optional(v.picklist(['ASC', 'DESC']))
});
export type LocationQueryData = v.InferOutput<typeof locationQuerySchema>;

class Location {

    static async get({ id, search, limit, offset, orderBy, orderDir}: LocationQueryData){
        if (id) {
            const validatedId = safeParse(number(), id);
            if (!validatedId.success) throw new ValidationError();

            const rows = await sql`
                SELECT * FROM locations 
                WHERE id = ${validatedId.output} AND deleted_at IS NULL`;

            if (!rows.length) throw new NotFoundError();
            return rows[0];
        }
        const data: LocationQueryData = {search, limit, offset, orderBy, orderDir};

        const validatedData = safeParse(locationQuerySchema, data);
        if(!validatedData.success) throw new ValidationError();

        const rows = await sql`
            SELECT * FROM locations
            WHERE name ILIKE ${'%' + (validatedData.output.search ?? '') + '%'} AND deleted_at IS NULL
            ORDER BY ${validatedData.output.orderBy || 'id'}
            LIMIT ${validatedData.output.limit || 50} OFFSET ${validatedData.output.offset || 0}`;
        return rows;
    }

    static async create(data: LocationCreateData) {
        const validatedData = safeParse(locationCreate, data);
        if (!validatedData.success) throw new ValidationError();
        
        const rows = await sql`
            INSERT INTO locations ${sql(validatedData.output)} 
            RETURNING *`;
        return rows[0];
    }

    static async update(id: number, data: LocationCreateData) {
        const validatedId = safeParse(number(), id);
        if (!validatedId.success) throw new ValidationError();
        
        const validatedData = safeParse(locationCreate, data);
        if (!validatedData.success) throw new ValidationError();
        
        const rows = await sql`
            UPDATE locations SET ${sql(validatedData.output)}, updated_at = now()
            WHERE id = ${validatedId.output} 
            RETURNING OLD.path as old_path, *`;

        if(rows && validatedData.output.path) {
            await sql`
                UPDATE locations
                SET path = ${validatedData.output.path} || subpath(path,nlevel(${validatedData.output.path})), updated_at = now() 
                where path ~ ${`${rows[0].old_path}.*{1,}`}
            `;
        }

        if (!rows.length) throw new NotFoundError();
        return rows[0];
    }

    static async delete(id: number) {
        const validatedId = safeParse(number(), id);
        if (!validatedId.success) throw new ValidationError();
        
        const rows = await sql`
            UPDATE locations SET deleted_at = now(), updated_at = now() 
            WHERE id = ${validatedId.output} AND deleted_at IS NULL
            RETURNING *`;

        if(rows) {
            await sql`
                UPDATE locations
                SET deleted_at = now(), updated_at = now() 
                where path ~ ${`${rows[0].path}.*{1,}`}
            `;
        }

        if (!rows.length) throw new NotFoundError();
        return rows[0] ?? null;
    }

    static async getComponents(location_id: unknown) {
        const validatedId = safeParse(number(), location_id);
        if (!validatedId.success) throw new ValidationError();
        
        const rows = await sql`
            SELECT cu.*, c.sku, c.name AS component_name
            FROM component_location cu
            JOIN components c ON cu.component_id = c.id
            WHERE cu.location_id = ${validatedId.output}`;

        return rows;
    }
}
export default Location;