import sql from "../config/database.js";
import { NotFoundError } from "../utils/errors.js";
import type { PaginationData, ToolData, ToolFilterData } from "../utils/schemas.js";

export default class Tool {
    static async get({ search, limit, offset, orderBy, desc, category, manufacturer, state }: PaginationData & ToolFilterData) {
        return await sql`
            SELECT t.id, t.sku, t.name, t.manufacturer_id, t.model, t.serial_number, t.image_url, t.manual_url, t.category_id, t.location_id, t.state, t.acquisition_date, t.notes, m.name AS manufacturer, c.path AS category, l.path AS location_route FROM tools t
            LEFT JOIN manufacturers m ON t.manufacturer_id = m.id
            LEFT JOIN tool_categories c ON t.category_id = c.id
            LEFT JOIN locations l ON t.location_id = l.id
            WHERE t.name ILIKE ${'%' + (search || '') + '%'} AND t.deleted_at IS NULL
            ${category ? sql`AND t.category_id = ${category}` : sql``}
            ${manufacturer ? sql`AND t.manufacturer_id = ${manufacturer}` : sql``}
            ${state ? sql`AND t.state = ${state}` : sql``}
            ORDER BY ${sql(orderBy ? 't.'+ orderBy : 't.id')} ${desc === 'true' ? sql`DESC` : sql`ASC`}
            LIMIT ${limit || 50} OFFSET ${offset || 0}`;
    }

    static async getById(id: number) {
        const rows = await sql`
            SELECT t.id, t.sku, t.name, t.manufacturer_id, t.model, t.serial_number, t.image_url, t.manual_url, t.category_id, t.location_id, t.state, t.acquisition_date, t.notes, t.created_at, m.name AS manufacturer, c.path AS category, l.name AS location_name, l.path AS location_route, l.description AS location_description FROM tools t
            LEFT JOIN manufacturers m ON t.manufacturer_id = m.id
            LEFT JOIN tool_categories c ON t.category_id = c.id
            LEFT JOIN locations l ON t.location_id = l.id
            WHERE t.id = ${id} AND t.deleted_at IS NULL`;
        if (rows.length === 0) throw new NotFoundError();
        return rows;
    }

    static async create(data: ToolData) {
        return await sql`
            INSERT INTO tools ${sql(data)} 
            RETURNING id, sku, name, manufacturer_id, model, serial_number, image_url, manual_url, category_id, location_id, state, acquisition_date, notes`;
    }

    static async update(id: number, data: ToolData) {
        const rows = await sql`
            UPDATE tools SET ${sql(data)}, updated_at = now() 
            WHERE id = ${id} AND deleted_at IS NULL
            RETURNING id, sku, name, manufacturer_id, model, serial_number, image_url, manual_url, category_id, location_id, state, acquisition_date, notes`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async delete(id: number) {
        const rows = await sql`
            UPDATE tools 
            SET deleted_at = now(), updated_at = now() 
            WHERE id = ${id} AND deleted_at IS NULL
            RETURNING id, sku, name, manufacturer_id, model, serial_number, image_url, manual_url, category_id, location_id, state, acquisition_date, notes`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async restore(id: number) {
        const rows = await sql`
            UPDATE tools 
            SET deleted_at = NULL, updated_at = now() 
            WHERE id = ${id} AND deleted_at IS NOT NULL
            RETURNING id, sku, name, manufacturer_id, model, serial_number, image_url, manual_url, category_id, location_id, state, acquisition_date, notes`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }
}
