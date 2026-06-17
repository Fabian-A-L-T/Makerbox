import sql from "../config/database.js";
import { safeParse, number } from "valibot";
import { ValidationError, NotFoundError } from "../errors.js";
import { MovementCreate, type MovementCreateData} from "./schemas.js";
import * as v from 'valibot';

const sortableColumns = ['created_at'];

const movementQuerySchema = v.object({
    id: v.optional(v.fallback(v.pipe(v.number(), v.minValue(1)), 0)),
    limit: v.optional(v.fallback(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(1), v.maxValue(100)), 50)),
    offset: v.optional(v.fallback(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(0)), 0)),
    orderBy: v.optional(v.fallback(v.picklist(sortableColumns), 'created_at')),
    desc: v.optional(v.fallback(v.boolean(), false))
});
export type MovementQueryData = v.InferOutput<typeof movementQuerySchema>;

class Movement {
    
    static async get({id, limit, offset, orderBy, desc}: MovementQueryData) {
        if (id) {
            const validatedID = safeParse(number(), id);
            if (!validatedID.success) throw new ValidationError();

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
                WHERE m.id = ${validatedID.output}`;

            if (rows.length === 0) throw new NotFoundError();
            return rows[0];
        }
        else {
            const data = {limit, offset, orderBy, desc};
            const validatedData = safeParse(movementQuerySchema, data);
            if (!validatedData.success) throw new ValidationError();

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
                ORDER BY ${sql(validatedData.output.orderBy ? 'm.'+validatedData.output.orderBy : 'm.created_at')} ${validatedData.output.desc ? sql`DESC` : sql`ASC`}
                LIMIT ${validatedData.output.limit || 50} OFFSET ${validatedData.output.offset || 0}`;
            return rows;
        }
    }

    static async create(data: MovementCreateData) {
        const validatedData = safeParse(MovementCreate, data);
        if (!validatedData.success) {console.log(validatedData.issues); throw new ValidationError();}
        
        const rows = await sql`
            INSERT INTO stock_movements ${sql(validatedData.output)} 
            RETURNING *`;
        return rows;
    }
}
export default Movement;
