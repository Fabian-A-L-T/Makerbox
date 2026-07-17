import sql from '../config/database.js';
import { componentShow, type ComponentFilterData, type PaginationData, type ComponentData } from '../utils/schemas.js';
import { NotFoundError } from '../utils/errors.js';

export default class Component {
    static async get({search, limit, offset, orderBy, desc, category, manufacturer}: ComponentFilterData & PaginationData) {
            let categories: number[] = [];
            if(category) {
                const categoryData = await sql`
                    SELECT * FROM component_categories
                    WHERE id = ${category}`;
                const data = await sql`
                    SELECT id FROM component_categories
                    WHERE path ~ ${'*.' + categoryData[0]['path'] + '.*'} AND deleted_at IS NULL`;
                
                data.forEach((value) => categories.push(value['id']));
            }
            return await sql`
                SELECT comp.id, comp.name, comp.sku, comp.description, comp.category_id, comp.manufacturer_id, comp.stock, comp.stock_min, comp.datasheet_url, comp.image_url, comp.notes, c.path AS category, m.name AS manufacturer FROM components comp
                JOIN component_categories c ON comp.category_id = c.id
                JOIN manufacturers m ON comp.manufacturer_id = m.id
                WHERE comp.name ILIKE ${'%' + (search || '') + '%'} AND comp.deleted_at IS NULL
                ${category ? sql`AND category_id IN ${sql(categories)}` : sql``}
                ${manufacturer ? sql`AND manufacturer_id = ${manufacturer}` : sql``}
                ORDER BY ${sql(orderBy ? 'comp.'+ orderBy : 'comp.name')} ${desc === 'true' ? sql`DESC` : sql`ASC`}
                LIMIT ${limit || 50} OFFSET ${offset || 0}`;
    }

    static async getById(id: number) {
        const rows = await sql`
            SELECT comp.*, c.path AS category, m.name AS manufacturer FROM components comp
            JOIN component_categories c ON comp.category_id = c.id
            JOIN manufacturers m ON comp.manufacturer_id = m.id
            WHERE comp.id = ${id} AND comp.deleted_at IS NULL`;

        if (!rows.length) throw new NotFoundError();
        return rows;
    }

    static async create(data: ComponentData){
        return await sql`
            INSERT INTO components ${sql(data)} 
            RETURNING ${sql(componentShow)}`;
    }

    static async update(id: number, data: ComponentData){
        const rows = await sql`
            UPDATE components SET ${sql(data)}, updated_at = now() 
            WHERE id = ${id} AND deleted_at IS NULL
            RETURNING ${sql(componentShow)}`;

        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async restore(id: number){
        const rows = await sql`
            UPDATE components
            SET deleted_at = null, updated_at = now() 
            WHERE id = ${id} AND deleted_at IS NOT NULL
            RETURNING id, ${sql(componentShow)}`;

        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async delete(id: number){
        const rows = await sql`
            UPDATE components 
            SET deleted_at = now(), updated_at = now() 
            WHERE id = ${id} AND deleted_at IS NULL
            RETURNING ${sql(componentShow)}`;

        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async getLocations({component_id, location_id}:{component_id: number, location_id?: number}) {
        const rows = await sql`
            SELECT cl.*, l.name AS location_name, l.path AS location_route
            FROM component_location cl
            JOIN locations l ON cl.location_id = l.id
            WHERE cl.component_id = ${component_id} ${location_id ? sql` AND cl.location_id = ${location_id}` : sql``}`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async getAllLocations(component_id: number) {
        return await sql`
            SELECT cl.*, l.name AS location_name, l.path AS location_route
            FROM component_location cl
            JOIN locations l ON cl.location_id = l.id
            WHERE cl.component_id = ${component_id}`;
    }

    static async addToLocation(component_id: number, location_id: number, amount: number){
        return await sql`
            INSERT INTO component_location (component_id, location_id, amount)
            VALUES (${component_id}, ${location_id}, ${amount})
            RETURNING *`;
    }

    static async updateQuantity(component_id: number, location_id: number, amount: number){
        const rows = await sql`
            UPDATE component_location
            SET amount = ${amount}
            WHERE component_id = ${component_id} AND location_id = ${location_id}
            RETURNING *`;
        
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async removeFromLocation(component_id: number, location_id: number){
        const rows = await sql`
            DELETE FROM component_location
            WHERE component_id = ${component_id} AND location_id = ${location_id}
            RETURNING *`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }
}
