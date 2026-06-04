import sql from '../config/database.js';
import { safeParse, number, string } from 'valibot';
import { componentShow, ComponentCreate, type ComponentCreateData } from './schemas.js';
import { ValidationError, NotFoundError } from '../errors.js';
import * as v from 'valibot';

const sortableColumns = ['name', 'stock', 'created_at'];

const componentQuerySchema = v.object({
    id: v.optional(v.number()),
    search: v.optional(v.string()),
    category: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number())),
    manufacturer: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number())),
    limit: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(1), v.maxValue(100))),
    offset: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(0))),
    orderBy: v.optional(v.fallback(v.picklist(sortableColumns), 'name')),
    desc: v.optional(v.pipe(v.string(), v.transform(value => value === 'true'), v.boolean()))
});
export type ComponentQueryData = v.InferOutput<typeof componentQuerySchema>;

class Component {

    static async get({id, search, limit, offset, orderBy, desc, category, manufacturer}: ComponentQueryData) {
        if (id) {
            const validatedId = safeParse(number(), id);
            if (!validatedId.success) throw new ValidationError();

            const rows = await sql`
                SELECT comp.*, c.name AS category, m.name AS manufacturer FROM components comp
                JOIN component_categories c ON comp.category_id = c.id
                JOIN manufacturers m ON comp.manufacturer_id = m.id
                WHERE comp.id = ${validatedId.output} AND comp.deleted_at IS NULL`;

            if (!rows.length) throw new NotFoundError();
            return rows[0];
        }
        else {
            const data = {search, limit, offset, orderBy, desc, category, manufacturer};
            let categories: number[] = [];
            const validatedData = safeParse(componentQuerySchema, data);
            if (validatedData.issues) throw new ValidationError();

            if(validatedData.output.category) {
                const categoryData = await sql`
                    SELECT * FROM component_categories
                    WHERE id = ${validatedData.output.category}`;
                const data = await sql`
                    SELECT id FROM component_categories
                    WHERE path ~ ${'*.' + categoryData[0]['path'] + '.*'} AND deleted_at IS NULL`;
                
                data.forEach((value) => categories.push(value['id']));
            }

            const rows = await sql`
                SELECT comp.id, comp.name, comp.sku, comp.description, comp.category_id, comp.manufacturer_id, comp.stock, comp.stock_min, comp.metric, comp.datasheet_url, comp.image_url, comp.notes, c.name AS category, m.name AS manufacturer FROM components comp
                JOIN component_categories c ON comp.category_id = c.id
                JOIN manufacturers m ON comp.manufacturer_id = m.id
                WHERE comp.name ILIKE ${'%' + (validatedData.output.search || '') + '%'} AND comp.deleted_at IS NULL
                ${validatedData.output.category ? sql`AND category_id IN ${sql(categories)}` : sql``}
                ${validatedData.output.manufacturer ? sql`AND manufacturer_id = ${validatedData.output.manufacturer}` : sql``}
                ORDER BY ${sql(validatedData.output.orderBy ? 'comp.'+validatedData.output.orderBy : 'comp.name')} ${validatedData.output.desc ? sql`DESC` : sql`ASC`}
                LIMIT ${validatedData.output.limit || 50} OFFSET ${validatedData.output.offset || 0}`;
            return rows;
        }
    }

    static async create(data: ComponentCreateData){
        const validatedData = safeParse(ComponentCreate, data);
        if(!validatedData.success) throw validatedData.issues;
        const rows = await sql`
            INSERT INTO components ${sql(validatedData.output)} 
            RETURNING ${sql(componentShow)}`;
        return rows[0];
    }

    static async update(id: number, data: ComponentCreateData){
        const validatedId = safeParse(number(), id);
        if(!validatedId.success) throw new ValidationError();

        const validatedData = safeParse(ComponentCreate, data);
        if(!validatedData.success) throw new ValidationError();

        const rows = await sql`
            UPDATE components SET ${sql(validatedData.output)}, updated_at = now() 
            WHERE id = ${validatedId.output} AND deleted_at IS NULL
            RETURNING ${sql(componentShow)}`;

        if(!rows.length) throw new NotFoundError();
        return rows[0];
    }

    static async restore(id: number){
        const validatedId = safeParse(number(), id);
        if(!validatedId.success) throw new ValidationError();
        
        const rows = await sql`
            UPDATE components
            SET deleted_at = null, updated_at = now() 
            WHERE id = ${validatedId.output} AND deleted_at IS NOT NULL
            RETURNING id, ${sql(componentShow)}`;

        if(!rows.length) throw new NotFoundError();
        return rows[0];
    }

    static async delete(id: number){
        const validatedId = safeParse(number(), id);
        if(!validatedId.success) throw new ValidationError();

        const rows = await sql`
            UPDATE components 
            SET deleted_at = now(), updated_at = now() 
            WHERE id = ${validatedId.output} AND deleted_at IS NULL
            RETURNING ${sql(componentShow)}`;

        if(!rows.length) throw new NotFoundError();
        return rows[0];
    }

    static async getLocations(id: number){
        const validatedId = safeParse(number(), id);
        if(!validatedId.success) throw new ValidationError();

        const rows = await sql`
            SELECT cu.*, u.name AS location_name
            FROM component_location cu
            JOIN locations u ON cu.location_id = u.id
            WHERE cu.component_id = ${validatedId.output}`;

        return rows;
    }

    static async addToLocation(component_id: number, location_id: number, amount: number){
        const validatedComponentId = safeParse(number(), component_id);
        const validatedLocationId = safeParse(number(), location_id);
        const validatedQuantity = safeParse(number(), amount);
        if(!validatedComponentId.success || !validatedLocationId.success || !validatedQuantity.success) throw new ValidationError();
        const rows = await sql`
            INSERT INTO component_location (component_id, location_id, amount)
            VALUES (${validatedComponentId.output}, ${validatedLocationId.output}, ${validatedQuantity.output})
            RETURNING *`;
        return rows[0];
    }

    static async updateQuantity(component_id: number, location_id: number, amount: number){
        const validatedComponentId = safeParse(number(), component_id);
        const validatedLocationId = safeParse(number(), location_id);
        const validatedQuantity = safeParse(number(), amount);
        if(!validatedComponentId.success || !validatedLocationId.success || !validatedQuantity.success) throw new ValidationError();
        const rows = await sql`
            UPDATE component_location
            SET amount = ${validatedQuantity.output}
            WHERE component_id = ${validatedComponentId.output} AND location_id = ${validatedLocationId.output}
            RETURNING *`;
        
        if(!rows.length) throw new NotFoundError();
        return rows[0];
    }

    static async removeFromLocation(component_id: number, location_id: number){
        const validatedComponentId = safeParse(number(), component_id);
        const validatedLocationId = safeParse(number(), location_id);
        if(!validatedComponentId.success || !validatedLocationId.success) throw new ValidationError();
        const rows = await sql`
            DELETE FROM component_location
            WHERE component_id = ${validatedComponentId.output} AND location_id = ${validatedLocationId.output}
            RETURNING *`;
        
        if(!rows.length) throw new NotFoundError();
        return rows[0];
    }
}
export default Component;