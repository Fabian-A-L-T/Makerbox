import sql from '../config/database.js';
import { safeParse, number, string } from 'valibot';
import { CategoryCreate, type CategoryCreateData } from './schemas.js';
import { ValidationError, NotFoundError } from '../errors.js';
import * as v from 'valibot';

const sortableColumns = ['id', 'name'];

const categoryQuerySchema = v.object({
    id: v.optional(v.number()),
    search: v.optional(v.string()),
    limit: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(1), v.maxValue(100))),
    offset: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(0))),
    orderBy: v.optional(v.picklist(sortableColumns)),
    orderDir: v.optional(v.picklist(['ASC', 'DESC']))
});
export type CategoryQueryData = v.InferOutput<typeof categoryQuerySchema>;

class ToolCategory {

    static async get({ id, search, limit, offset, orderBy, orderDir}: CategoryQueryData){

        if(id){
            const validatedId = safeParse(number(), id);
            if(!validatedId.success) throw new ValidationError();

            const rows = await sql`
                SELECT * FROM tool_categories 
                WHERE id = ${validatedId.output} AND deleted_at IS NULL`;
            
            if(!rows.length) throw new NotFoundError();
            return rows[0];
        }
        else {
            const data: CategoryQueryData = {search, limit, offset, orderBy, orderDir};

            const validatedData = safeParse(categoryQuerySchema, data);
            if(!validatedData.success) throw new ValidationError();

            const rows = await sql`
                SELECT * FROM tool_categories
                WHERE name ILIKE ${'%' + (validatedData.output.search ?? '') + '%'} AND deleted_at IS NULL
                ORDER BY ${validatedData.output.orderBy || 'id'}
                LIMIT ${validatedData.output.limit || 50} OFFSET ${validatedData.output.offset || 0}`;
            return rows;
        }
    }

    static async create(data: CategoryCreateData){
        const validatedData = safeParse(CategoryCreate, data);
        if(!validatedData.success) throw validatedData.issues;

        const rows = await sql`
            INSERT INTO tool_categories ${sql(validatedData.output)} 
            RETURNING *`;
        
        return rows[0];
    }
    
    static async update(id: number, data: CategoryCreateData){
        const validatedId = safeParse(number(), id);
        if(!validatedId.success) throw new ValidationError();

        const validatedData = safeParse(CategoryCreate, data);
        if(!validatedData.success) throw validatedData.issues;

        const rows = await sql`
            UPDATE tool_categories SET ${sql(validatedData.output)}, updated_at = now()
            WHERE id = ${validatedId.output}
            RETURNING OLD.path as old_path, *`;

        if(rows && validatedData.output.path) {
            await sql`
                UPDATE tool_categories
                SET path = ${validatedData.output.path} || subpath(path,nlevel(${validatedData.output.path})), updated_at = now() 
                where path ~ ${`${rows[0].old_path}.*{1,}`}
            `;
        }

        if(!rows.length) throw new NotFoundError();
        return rows[0];
    }

    static async delete(id: number){
        const validatedId = safeParse(number(), id);
        if(!validatedId.success) throw new ValidationError();

        const rows = await sql`
            UPDATE tool_categories SET deleted_at = now(), updated_at = now()
            WHERE id = ${validatedId.output}  AND deleted_at IS NULL
            RETURNING *`;
        
        if(!rows.length) throw new NotFoundError();
        return rows[0];
    }

    static async getChildren(path?: string){
        if (!path) {
            const rows = await sql`
                SELECT * FROM tool_categories 
                WHERE nlevel(path) = 1`;
            return rows;
        }
        const validatedPath = safeParse(string(), path);
        if(!validatedPath.success) throw new ValidationError();

        const queryPath = '*.' + validatedPath.output + '.*';

        const rows = await sql`
            SELECT * FROM tool_categories 
            WHERE path ~ ${queryPath}`;
        return rows;
    }
}
export default ToolCategory;