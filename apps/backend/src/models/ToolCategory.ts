import sql from '../config/database.js';
import type { CategoryData, CategoryFilterData, PaginationData } from '../utils/schemas.js';
import { NotFoundError } from '../utils/errors.js';

export default class ToolCategory {

    static async get({ search, limit, offset, orderBy, desc, exclude}: PaginationData & CategoryFilterData){
        return await sql`
            SELECT id, name, path FROM tool_categories
            WHERE name ILIKE ${'%' + (search ?? '') + '%'} AND deleted_at IS NULL
            ${exclude ? sql`AND id != ${exclude}` : sql``}
            ORDER BY ${sql(orderBy || 'path')} ${desc === 'true' ? sql`DESC` : sql`ASC`}
            LIMIT ${limit || 50} OFFSET ${offset || 0}`;
    }
    static async getById(id: number) {
        const rows = await sql`
            SELECT id, name, path FROM tool_categories 
            WHERE id = ${id} AND deleted_at IS NULL`;
        
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async create(data: CategoryData){
        const rows = await sql`
            INSERT INTO tool_categories ${sql(data)} 
            RETURNING id, name, path`;
        return rows;
    }
    
    static async update(id: number, data: CategoryData){
        const rows = await sql`
            UPDATE tool_categories SET ${sql(data)}, updated_at = now()
            WHERE id = ${id} AND deleted_at IS NULL
            RETURNING id, name, path, OLD.path as old_path`;

        if(rows.length && data.path) {
            await sql`
                UPDATE tool_categories
                SET path = ${data.path} || subpath(path,nlevel(${rows[0].old_path})), updated_at = now() 
                where path ~ ${`${rows[0].old_path}.*{1,}`}
            `;
        }

        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async delete(id: number){
        const rows = await sql`
            UPDATE tool_categories SET deleted_at = now(), updated_at = now()
            WHERE id = ${id}  AND deleted_at IS NULL
            RETURNING id, name, path`;
        
        if(rows.length) {
            await sql`
                UPDATE tool_categories
                SET deleted_at = now(), updated_at = now() 
                where path ~ ${`${rows[0].path}.*{1,}`}
            `;
        }
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async getChildren(path?: string){
        if (!path) {
            const rows = await sql`
                SELECT id, name, path FROM tool_categories 
                WHERE nlevel(path) = 1 AND deleted_at IS NULL`;
            return rows;
        }
        const queryPath = '*.' + path + '.*';
        const rows = await sql`
            SELECT id, name, path FROM tool_categories 
            WHERE path ~ ${queryPath} AND deleted_at IS NULL`;
        return rows;
    }

    static async restore(id: number){
        const rows = await sql`
            UPDATE tool_categories SET deleted_at = NULL, updated_at = now()
            WHERE id = ${id} AND deleted_at IS NOT NULL
            RETURNING id, name, path`;

        if(rows.length) {
            await sql`
                UPDATE tool_categories
                SET deleted_at = NULL, updated_at = now() 
                where path ~ ${`${rows[0].path}.*{1,}`}
            `;
        }
        if(!rows.length) throw new NotFoundError();
        return rows;
    }
}
