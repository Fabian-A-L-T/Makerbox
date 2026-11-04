import sql from "../config/database.js";
import { NotFoundError } from "../utils/errors.js";
import type { PaginationData, ProjectFilterData, ProjectData, ProjectToolData, ProjectComponentData, UserIDData, MilestoneData } from "../utils/schemas.js";

export default class Project {
    static async get({ search, limit, offset, orderBy, desc, state, responsible_id}: PaginationData & ProjectFilterData & {responsible_id: UserIDData}) {
        return await sql`
            SELECT p.id, p.name, p.description, p.responsible_id, p.state, p.end_date_estimated, p.start_date, p.end_date_real, p.budget, p.image_url, p.repository_url, u.name AS user_name
            FROM projects p
            LEFT JOIN users u ON p.responsible_id = u.id
            WHERE p.name ILIKE ${'%' + (search || '') + '%'} AND p.deleted_at IS NULL AND p.responsible_id = ${responsible_id} AND p.deleted_at IS NULL
            ${state ? sql`AND p.state = ${state}` : sql``}
            ORDER BY ${sql(orderBy ? 'p.'+ orderBy : 'p.id')} ${desc === 'true' ? sql`DESC` : sql`ASC`}
            LIMIT ${limit || 50} OFFSET ${offset || 0}`;
    }

    static async getById(project_id: number, user_id: number){
        const project = await sql`
            SELECT p.id, p.name, p.description, p.responsible_id, p.state, p.end_date_estimated, p.start_date, p.end_date_real, p.budget, p.image_url, p.repository_url, p.created_at, u.name AS user_name
            FROM projects p
            LEFT JOIN users u ON p.responsible_id = u.id
            WHERE p.id = ${project_id} AND p.responsible_id = ${user_id} AND p.deleted_at IS NULL`;

        if(project.length === 0) throw new NotFoundError();

        const components = await this.getComponents(project_id);
        const tools = await this.getTools(project_id);
        const milestones = await this.getMilestones(project_id);

        return {...project[0], components, tools, milestones};
    }

    static async create(data: ProjectData) {
        const rows = await sql`
            INSERT INTO projects ${sql(data)} 
            RETURNING id, name, description, responsible_id, state, end_date_estimated, start_date, end_date_real, budget, image_url, repository_url`;
        return rows;
    }

    static async update(id: number, data: ProjectData) {
        const rows = await sql`
            UPDATE projects SET ${sql(data)} 
            WHERE id = ${id} AND deleted_at IS NULL
            RETURNING id, name, description, responsible_id, state, end_date_estimated, start_date, end_date_real, budget, image_url, repository_url`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async updateState(id: number, user_id: number, state: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'){
        const rows = await sql`
            UPDATE projects SET state = ${state}
            WHERE id = ${id} AND responsible_id = ${user_id} AND deleted_at IS NULL
            RETURNING id, name, responsible_id, state`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async revertState(id: number, user_id: number){
        const project = await sql`
            SELECT id, responsible_id FROM projects
            WHERE id = ${id} AND responsible_id = ${user_id} AND deleted_at IS NULL`;

        if(project.length === 0) throw new NotFoundError();

        const project_milestones = await sql`
            SELECT * FROM project_milestones
            WHERE project_id = ${id} AND is_completed IS TRUE`;

        const project_component = await sql`
            SELECT * FROM project_component
            WHERE project_id = ${id} AND used_amount > 0`;

        const isPlanning = project_milestones.length === 0 && project_component.length === 0;

        const rows = await sql`
            UPDATE projects SET state = ${isPlanning ? 'planning' : 'active'}
            WHERE id = ${id} AND responsible_id = ${user_id} AND deleted_at IS NULL
            RETURNING id, name, responsible_id, state`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async delete(id: number) {
        const rows = await sql`
            DELETE FROM projects 
            WHERE id = ${id} AND deleted_at IS NULL
            RETURNING id, name, description, responsible_id, state, end_date_estimated, start_date, end_date_real, budget, image_url, repository_url`;
        
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async getMilestones(project_id: number) {
        const rows = await sql`
            SELECT * FROM project_milestones
            WHERE project_id = ${project_id}
            ORDER BY order_index`;
        return rows;
    }

    static async createMilestone(data: MilestoneData) {
        return await sql`
            INSERT INTO project_milestones ${sql(data)}
            RETURNING *`;
    }

    static async updateMilestone(user_id: number, milestone_id: number, data: MilestoneData) {
        const project = await sql`
            SELECT id, responsible_id FROM projects
            WHERE id = ${data.project_id} AND responsible_id = ${user_id} AND deleted_at IS NULL`;

        if(project.length === 0) throw new NotFoundError();
        
        const rows = await sql`
            UPDATE project_milestones SET ${sql(data)}
            WHERE id = ${milestone_id}
            RETURNING *`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async deleteMilestone(user_id: number, project_id: number, milestone_id: number) {
        const project = await sql`
            SELECT id, responsible_id FROM projects
            WHERE id = ${project_id} AND responsible_id = ${user_id} AND deleted_at IS NULL`;

        if(project.length === 0) throw new NotFoundError();

        const rows = await sql`
            DELETE FROM project_milestones 
            WHERE id = ${milestone_id} 
            RETURNING *`;
        if(!rows.length) throw new NotFoundError();
        return rows;
    }

    static async completeMilestone(user_id: number, project_id: number) {
        const project = await sql`
            SELECT id, responsible_id FROM projects
            WHERE id = ${project_id} AND responsible_id = ${user_id} AND deleted_at IS NULL`;

        if(project.length === 0) throw new NotFoundError();

        const rows = await sql`
            SELECT * FROM project_milestones
            WHERE project_id = ${project_id} AND is_completed IS FALSE
            ORDER BY order_index`;
        if(!rows.length) throw new NotFoundError("No se pueden completar mas hitos");
        if(rows[0].order_index === 0) {
            await sql`
                UPDATE projects SET state = 'active'
                WHERE id = ${project_id}`;
        }
        return await sql`
            UPDATE project_milestones SET is_completed = TRUE
            WHERE id = ${rows[0].id} 
            RETURNING *`;
    }

    static async revertMilestone(user_id: number, project_id: number) {
        const project = await sql`
            SELECT id, responsible_id FROM projects
            WHERE id = ${project_id} AND responsible_id = ${user_id} AND deleted_at IS NULL`;

        if(project.length === 0) throw new NotFoundError();

        const rows = await sql`
            SELECT * FROM project_milestones
            WHERE project_id = ${project_id} AND is_completed IS TRUE
            ORDER BY order_index DESC`;
        if(!rows.length) throw new NotFoundError("No se pueden revertir mas hitos");
        if(rows[0].order_index === 0) {
            await sql`
                UPDATE projects SET state = 'planning'
                WHERE id = ${project_id}`;
        }
        return await sql`
            UPDATE project_milestones SET is_completed = FALSE
            WHERE id = ${rows[0].id} 
            RETURNING *`;
    }

    static async getTools(project_id: number) {
        return await sql`
            SELECT ph.*, h.sku, h.name AS tool_name
            FROM project_tool ph
            JOIN tools h ON ph.tool_id = h.id
            WHERE ph.project_id = ${project_id}`;
    }

    static async addTool(data: ProjectToolData) {
        return await sql`
            INSERT INTO project_tool ${sql(data)} 
            RETURNING *`;
    }

    static async updateTool(data: ProjectToolData) {
        const updateData = {
            ...(data.loan_date !== undefined && {loan_date: data.loan_date}),
            ...(data.return_date !== undefined && {return_date: data.return_date}),
            user_id: data.user_id
        };
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
            SELECT pc.project_id, pc.component_id, pc.planned_amount,
                pc.used_amount, pc.notes, c.sku, c.name, c.unit_cost
            FROM project_component pc
            JOIN components c ON pc.component_id = c.id
            WHERE pc.project_id = ${project_id}`;
    }

    static async addComponent(data: ProjectComponentData) {
        return await sql`
            INSERT INTO project_component (project_id, component_id, planned_amount, used_amount, notes)
            VALUES (${data.project_id}, ${data.component_id}, ${data.planned_amount}, ${data.used_amount}, ${data.notes ?? null})
            RETURNING project_id, component_id, planned_amount, used_amount, notes`;
    }

    static async updateComponent(data: ProjectComponentData) {
        const rows = await sql`
            UPDATE project_component
            SET planned_amount = ${data.planned_amount}, used_amount = ${data.used_amount}, notes = ${data.notes ?? null}
            WHERE project_id = ${data.project_id} AND component_id = ${data.component_id}
            RETURNING project_id, component_id, planned_amount AS planned_amount, used_amount, notes`;
        
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
