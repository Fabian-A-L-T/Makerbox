import sql from "../config/database.js";
import { safeParse, number } from "valibot";
import { ValidationError, NotFoundError } from "../errors.js";
import { ToolCreate, type ToolCreateData, toolShow, ToolStatusSchema } from "./schemas.js";
import * as v from 'valibot';

const toolQuerySchema = v.object({
    id: v.optional(v.number()),
    search: v.optional(v.string()),
    category: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number())),
    manufacturer: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number())),
    limit: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(1), v.maxValue(100))),
    offset: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(0))),
    orderBy: v.optional(v.picklist(['id', 'name', 'created_at'])),
    desc: v.optional(v.pipe(v.string(), v.transform(value => value === 'true'), v.boolean()))
});
export type ToolQueryData = v.InferOutput<typeof toolQuerySchema>;

class Tool {
    
    static async get({id, search, limit, offset, orderBy, desc, category, manufacturer}: ToolQueryData) {
        try {
            if (id) {
                const validatedId = safeParse(number(), id);
                if (!validatedId.success) throw new ValidationError();
                const rows = await sql`
                    SELECT t.*, m.name AS manufacturer, c.name AS category, l.name AS location FROM tools t
                    LEFT JOIN manufacturers m ON t.manufacturer_id = m.id
                    LEFT JOIN tool_categories c ON t.category_id = c.id
                    LEFT JOIN locations l ON t.location_id = l.id
                    WHERE t.id = ${validatedId.output}`;
                if (rows.length === 0) throw new NotFoundError();
                return rows[0];
            }
            else {
                const data = {search, limit, offset, orderBy, desc, category, manufacturer};
                const validatedData = safeParse(toolQuerySchema, data);
                if (validatedData.issues) throw new ValidationError();
                const rows = await sql`
                    SELECT t.*, m.name AS manufacturer, c.name AS category, l.name AS location FROM tools t
                    LEFT JOIN manufacturers m ON t.manufacturer_id = m.id
                    LEFT JOIN tool_categories c ON t.category_id = c.id
                    LEFT JOIN locations l ON t.location_id = l.id
                    WHERE t.name ILIKE ${'%' + (validatedData.output.search || '') + '%'} AND t.deleted_at IS NULL
                    ${validatedData.output.category ? sql`AND t.category_id = ${validatedData.output.category}` : sql``}
                    ${validatedData.output.manufacturer ? sql`AND t.manufacturer_id = ${validatedData.output.manufacturer}` : sql``}
                    ORDER BY ${sql(validatedData.output.orderBy ? 't.'+ validatedData.output.orderBy : 't.id')} ${validatedData.output.desc ? sql`DESC` : sql`ASC`}
                    LIMIT ${validatedData.output.limit || 50} OFFSET ${validatedData.output.offset || 0}`;
                return rows;
            }
        } catch (error) {
            throw error;
        }
    }

    static async create(data: ToolCreateData) {
        try {
            console.log(data);
            const validatedData = safeParse(ToolCreate, data);
            if (!validatedData.success) {
                console.log(validatedData.issues);
                throw new ValidationError();}

            const tool = await sql`
                INSERT INTO tools ${sql(validatedData.output)} 
                RETURNING *`;

            return tool[0];

        } catch (error) {
            throw error;
        }
    }

    static async update(id: number, data: ToolCreateData) {
        try {
            const validatedId = safeParse(number(), id);
            if(!validatedId.success) throw new ValidationError();
            
            const validatedData = safeParse(ToolCreate, data);
            if(!validatedData.success) throw new ValidationError();
            
            const rows = await sql`
                UPDATE tools SET ${sql(validatedData.output)}, updated_at = now() 
                WHERE id = ${validatedId.output}
                RETURNING *`;
            if(!rows.length) throw new NotFoundError();
            return rows[0];

        } catch (error) {
            throw error;
        }
    }

    static async delete(id: number) {
        try {
            const validatedId = safeParse(number(), id);
            if(!validatedId.success) throw new ValidationError();

            const rows = await sql`
                UPDATE tools 
                SET deleted_at = now(), updated_at = now() 
                WHERE id = ${validatedId.output} AND deleted_at IS NULL
                RETURNING *`;
            
            if(!rows.length) throw new NotFoundError();
            return rows[0];
            
        } catch (error) {
            throw error;
        }
    }
}
export default Tool;
