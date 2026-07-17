import sql from "../config/database.js";
import { NotFoundError } from "../utils/errors.js";
import type { PaginationData, ProjectFilterData, ProjectData, ProjectToolData, ProjectComponentData } from "../utils/schemas.js";

export default class Project {
    static async get({ userId, search, limit, offset, orderBy, desc, state}: PaginationData & ProjectFilterData) {
        return await sql`
            SELECT p.*, u.name AS user_name
            FROM projects p
            LEFT JOIN users u ON p.responsible_id = u.id
            WHERE p.name ILIKE ${'%' + (search || '') + '%'} AND p.deleted_at IS NULL
            ${userId ? sql`AND p.responsible_id = ${userId}` : sql``}
            ${state ? sql`AND p.state = ${state}` : sql``}
            ORDER BY ${sql(orderBy ? 'p.'+ orderBy : 'p.id')} ${desc === 'true' ? sql`DESC` : sql`ASC`}
            LIMIT ${limit || 50} OFFSET ${offset || 0}`;
    }

    static async getById(id: number){
        const project = await sql`
            SELECT p.*, u.name AS user_name
            FROM projects p
            LEFT JOIN users u ON p.responsible_id = u.id
            WHERE p.id = ${id}`;

        if(project.length === 0) throw new NotFoundError();

        const componentes = await sql`
            SELECT pc.*, c.sku, c.name AS component_name
            FROM project_component pc
            JOIN components c ON pc.component_id = c.id
            WHERE pc.project_id = ${id}`;

        const herramientas = await sql`
            SELECT ph.*, h.sku, h.name AS tool_name
            FROM project_tool ph
            JOIN tools h ON ph.tool_id = h.id
            WHERE ph.project_id = ${id}`;
        return {...project[0], componentes: componentes, herramientas: herramientas};
    }

    static async create(data: ProjectData) {
        const rows = await sql`
            INSERT INTO projects ${sql(data)} 
            RETURNING *`;
        return rows;
    }

    static async update(id: number, data: ProjectData) {
        const rows = await sql`
            UPDATE projects SET ${sql(data)} 
            WHERE id = ${id} 
            RETURNING *`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async delete(id: number) {
        const rows = await sql`
            DELETE FROM projects 
            WHERE id = ${id} 
            RETURNING *`;
        
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async getTools(project_id: number) {
        return await sql`
            SELECT ph.*, h.sku, h.name AS tool_name, h.state AS tool_state,
                u.name AS user_name
            FROM project_tool ph
            JOIN tools h ON ph.tool_id = h.id
            LEFT JOIN users u ON ph.user_id = u.id
            WHERE ph.project_id = ${project_id}`;
    }

    static async addTool(data: ProjectToolData) {
        return await sql`
            INSERT INTO project_tool ${sql(data)} 
            RETURNING *`;
    }

    static async updateTool(data: ProjectToolData) {
        const updateData = {loan_date: data.loan_date, return_date: data.return_date, user_id: data.user_id}
        const rows = await sql`
            UPDATE project_tool SET ${sql(updateData)}
            WHERE project_id = ${data.project_id} AND tool_id = ${data.tool_id}
            RETURNING *`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async removeTool(project_id: number, tool_id: number) {
        const rows = await sql`
            DELETE FROM project_tool
            WHERE project_id = ${project_id} AND tool_id = ${tool_id}
            RETURNING *`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async getComponents(project_id: number) {
        return await sql`
            SELECT pc.*, c.sku, c.name AS component_name
            FROM project_component pc
            JOIN components c ON pc.component_id = c.id
            WHERE pc.project_id = ${project_id}`;
    }

    static async addComponent(data: ProjectComponentData) {
        return await sql`
            INSERT INTO project_component ${sql(data)} 
            RETURNING *`;
    }

    static async updateComponent(data: ProjectComponentData) {
        const updateData = {planned_quantity: data.planned_quantity, used_quantity: data.used_quantity, notes: data.notes}
        const rows = await sql`
            UPDATE project_component SET ${sql(updateData)}
            WHERE project_id = ${data.project_id} AND component_id = ${data.component_id}
            RETURNING *`;
        
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async removeComponent(project_id: number, component_id: number) {
        const rows = await sql`
            DELETE FROM project_component
            WHERE project_id = ${project_id} AND component_id = ${component_id}
            RETURNING *`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }
}
