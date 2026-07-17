import sql from '../config/database.js';
import type { CategoryFilterData, PaginationData, CategoryData } from '../utils/schemas.js';
import { NotFoundError } from '../utils/errors.js';

export default class Category {

    static async get({ limit, offset, search, orderBy, desc, exclude }: PaginationData & CategoryFilterData){
        return await sql`
            SELECT * FROM component_categories
            WHERE name ILIKE ${'%' + (search ?? '') + '%'} AND deleted_at IS NULL
            ${exclude ? sql`AND id != ${exclude}` : sql``}
            ORDER BY ${sql(orderBy || 'path')} ${desc === 'true' ? sql`DESC` : sql`ASC`}
            LIMIT ${limit || 50} OFFSET ${offset || 0}`;
    }

    static async getById(id: number){
        const rows = await sql`
            SELECT * FROM component_categories 
            WHERE id = ${id} AND deleted_at IS NULL`;
        
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async create(data: CategoryData){
        const rows = await sql`
            INSERT INTO component_categories ${sql(data)} 
            RETURNING *`;
        return rows;
    }
    
    static async update(id: number, data: CategoryData){
        const rows = await sql`
            UPDATE component_categories SET ${sql(data)}, updated_at = now()
            WHERE id = ${id}
            RETURNING OLD.path as old_path, *`;

        if(rows && data.path) {
            await sql`
                UPDATE component_categories
                SET path = ${data.path} || subpath(path,nlevel(${rows[0].old_path})), updated_at = now() 
                where path ~ ${`${rows[0].old_path}.*{1,}`}`;
        }

        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async delete(id: number){
        const rows = await sql`
            UPDATE component_categories SET deleted_at = now(), updated_at = now()
            WHERE id = ${id} AND deleted_at IS NULL
            RETURNING *`;

        if(rows) {
            await sql`
                UPDATE component_categories
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
                SELECT * FROM component_categories 
                WHERE nlevel(path) = 1`;
            return rows;
        }
        const queryPath = '*.' + path + '.*';
        const rows = await sql`
            SELECT * FROM component_categories 
            WHERE path ~ ${queryPath}`;
        return rows;
    }
}
