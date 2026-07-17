import sql from "../config/database.js";
import { NotFoundError } from "../utils/errors.js";
import type { MovementData, MovementFilterData, PaginationData } from "../utils/schemas.js";

export default class Movement {
    static async get({ limit, offset, orderBy, desc = 'true'}: PaginationData & MovementFilterData) {
        return await sql`
            SELECT m.*,
                c.sku AS component_sku, c.name AS component_name,
                u.name AS user_name,
                lo.name AS origin_location_name,
                ld.name AS destination_location_name,
                p.name AS project_name
            FROM stock_movements m
            JOIN components c ON m.component_id = c.id
            LEFT JOIN users u ON m.user_id = u.id
            LEFT JOIN locations lo ON m.origin_location_id = lo.id
            LEFT JOIN locations ld ON m.destination_location_id = ld.id
            LEFT JOIN projects p ON m.project_id = p.id
            ORDER BY ${sql(orderBy ? 'm.'+ orderBy : 'm.created_at')} ${desc === 'true' ? sql`DESC` : sql`ASC`}
            LIMIT ${limit || 50} OFFSET ${offset || 0}`;
    }

    static async getById(id: number){
        const rows = await sql`
            SELECT m.*,
                c.sku AS component_sku, c.name AS component_name,
                u.name AS user_name,
                lo.name AS origin_location_name,
                ld.name AS destination_location_name,
                p.name AS project_name
            FROM stock_movements m
            JOIN components c ON m.component_id = c.id
            LEFT JOIN users u ON m.user_id = u.id
            LEFT JOIN locations lo ON m.origin_location_id = lo.id
            LEFT JOIN locations ld ON m.destination_location_id = ld.id
            LEFT JOIN projects p ON m.project_id = p.id
            WHERE m.id = ${id}`;
        if (rows.length === 0) throw new NotFoundError();
        return rows;
    }

    static async create(data: MovementData) {
        return await sql`
            INSERT INTO stock_movements ${sql(data)} 
            RETURNING *`;
    }
}
