import sql from "../config/database.js";
import { safeParse, number } from "valibot";
import { ValidationError, NotFoundError } from "../errors.js";
import { MovementCreate, MovementQuerySchema, type MovementCreateData, type MovementQueryData } from "./schemas.js";

class Movement {
    
    static async get({ id, query }: { id?: number, query?: MovementQueryData }) {
        if (id) {
            const validatedID = safeParse(number(), id);
            if (!validatedID.success) throw new ValidationError();

            const rows = await sql`
            SELECT m.*,
                c.sku AS component_sku, c.name AS component_name,
                u.name AS user_name,
                uo.name AS origin_location_name,
                ud.name AS destination_location_name,
                p.name AS project_name
            FROM stock_movements m
            JOIN components c ON m.component_id = c.id
            LEFT JOIN users u ON m.user_id = u.id
            LEFT JOIN locations uo ON m.origin_location_id = uo.id
            LEFT JOIN locations ud ON m.destination_location_id = ud.id
            LEFT JOIN projects p ON m.project_id = p.id
            WHERE m.id = ${validatedID.output} `;

            if (rows.length === 0) throw new NotFoundError();
            return rows[0];
        }
        else {
            let validatedQueryOutput: MovementQueryData = {};
            if (query) {
                const validatedQuery = safeParse(MovementQuerySchema, query);
                if (!validatedQuery.success) throw new ValidationError();
                validatedQueryOutput = validatedQuery.output;
            }
            const rows = await sql`
                SELECT m.*,
                    c.sku AS component_sku, c.name AS component_name,
                    u.name AS user_name,
                    uo.name AS origin_location_name,
                    ud.name AS destination_location_name,
                    p.name AS project_name
                FROM stock_movements m
                JOIN components c ON m.component_id = c.id
                LEFT JOIN users u ON m.user_id = u.id
                LEFT JOIN locations uo ON m.origin_location_id = uo.id
                LEFT JOIN locations ud ON m.destination_location_id = ud.id
                LEFT JOIN projects p ON m.project_id = p.id
                WHERE (${validatedQueryOutput.component_id ? sql`m.component_id = ${validatedQueryOutput.component_id}` : sql`TRUE`})
                AND (${validatedQueryOutput.type ? sql`m.type = ${validatedQueryOutput.type}` : sql`TRUE`})
                AND (${validatedQueryOutput.since ? sql`m.created_at >= ${validatedQueryOutput.since}` : sql`TRUE`})
                AND (${validatedQueryOutput.until ? sql`m.created_at <= ${validatedQueryOutput.until}` : sql`TRUE`})
                ORDER BY m.created_at DESC
                ${validatedQueryOutput.limit ? sql`LIMIT ${validatedQueryOutput.limit}` : sql`LIMIT 100`}
                ${validatedQueryOutput.offset ? sql`OFFSET ${validatedQueryOutput.offset}` : sql`OFFSET 0`}`;
            
            return rows;
        }
    }

    static async create(data: MovementCreateData) {
        const validatedData = safeParse(MovementCreate, data);
        if (!validatedData.success) throw new ValidationError("Invalid data");

        const rows = await sql`
            INSERT INTO stock_movements ${sql(validatedData.output)} 
            RETURNING *`;
        return rows;
    }
}
export default Movement;
