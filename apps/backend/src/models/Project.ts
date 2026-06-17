import sql from "../config/database.js";
import { safeParse, number } from "valibot";
import { ValidationError, NotFoundError } from "../errors.js";
import { ProjectCreate, type ProjectCreateData, ProjectStatusSchema, type ProjectToolCreateData, ProjectToolCreate, type ProjectComponentCreateData, ProjectComponentCreate } from "./schemas.js";
import * as v from 'valibot';

const projectQuerySchema = v.object({
    id: v.optional(v.number()),
    userId: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(0))),
    search: v.optional(v.string()),
    limit: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(1), v.maxValue(100))),
    offset: v.optional(v.pipe(v.string(), v.transform(parseInt), v.number(), v.minValue(0))),
    orderBy: v.optional(v.picklist(['id', 'name', 'created_at', 'budget'])),
    desc: v.optional(v.pipe(v.string(), v.transform(value => value === 'true'), v.boolean()))
});
export type ProjectQueryData = v.InferOutput<typeof projectQuerySchema>;

class Project {

    static async get({id, userId, search, limit, offset, orderBy, desc}: ProjectQueryData) {
        try {
            if (id) {
                const validatedId = safeParse(number(), id);
                if (!validatedId.success) throw new ValidationError();

                const project = await sql`
                    SELECT p.*, u.name AS user_name
                    FROM projects p
                    LEFT JOIN users u ON p.responsible_id = u.id
                    WHERE p.id = ${validatedId.output}
                `;

                if(project.length === 0) throw new NotFoundError();

                const componentes = await sql`
                    SELECT pc.*, c.sku, c.name AS component_name
                    FROM project_component pc
                    JOIN components c ON pc.component_id = c.id
                    WHERE pc.project_id = ${validatedId.output}
                `;

                const herramientas = await sql`
                    SELECT ph.*, h.sku, h.name AS tool_name
                    FROM project_tool ph
                    JOIN tools h ON ph.tool_id = h.id
                    WHERE ph.project_id = ${validatedId.output}
                `;
                return {...project[0], componentes: componentes, herramientas: herramientas};
            }
            else {
                const data = {search, userId, limit, offset, orderBy, desc};
                const validatedData = safeParse(projectQuerySchema, data);
                if (validatedData.issues) {console.log(validatedData.issues); throw new ValidationError()};
                
                return await sql`
                    SELECT p.*, u.name AS user_name
                    FROM projects p
                    LEFT JOIN users u ON p.responsible_id = u.id
                    WHERE p.name ILIKE ${'%' + (validatedData.output.search || '') + '%'} AND p.deleted_at IS NULL
                    ${validatedData.output.userId ? sql`AND p.responsible_id = ${validatedData.output.userId}` : sql``}
                    ORDER BY ${sql(validatedData.output.orderBy ? 'p.'+ validatedData.output.orderBy : 'p.id')} ${validatedData.output.desc ? sql`DESC` : sql`ASC`}
                    LIMIT ${validatedData.output.limit || 50} OFFSET ${validatedData.output.offset || 0}`;
            }
            
        } catch (error) {
            throw error;
        }
    }

    static async create(data: ProjectCreateData) {
        try {
            const validatedData = safeParse(ProjectCreate, data);
            if (!validatedData.success) throw new ValidationError();

            const rows = await sql`
                INSERT INTO projects ${sql(validatedData.output)} 
                RETURNING *`;

            return rows[0];

        } catch (error) {
            throw error;
        }
    }

    static async update(id: number, data: ProjectCreateData) {
        try {
            const validatedId = safeParse(number(), id);
            if (!validatedId.success) throw new ValidationError();

            const validatedData = safeParse(ProjectCreate, data);
            if (!validatedData.success)  {console.log(validatedData.issues); throw new ValidationError();}
            
            const rows = await sql`
                UPDATE projects SET ${sql(validatedData.output)} 
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
            if (!validatedId.success) throw new ValidationError();
            
            const rows = await sql`
                DELETE FROM projects 
                WHERE id = ${validatedId.output} 
                RETURNING *`;
            
            if(!rows.length) throw new NotFoundError();
            return rows[0];

        } catch (error) {
            throw error;
        }
    }

    static async getTools(project_id: number) {
        try {
            const validatedId = safeParse(number(), project_id);
            if (!validatedId.success) throw new ValidationError();
            
            const rows = await sql`
                SELECT ph.*, h.sku, h.name AS tool_name, h.state AS tool_state,
                    u.name AS user_name
                FROM project_tool ph
                JOIN tools h ON ph.tool_id = h.id
                LEFT JOIN users u ON ph.user_id = u.id
                WHERE ph.project_id = ${validatedId.output}`;
            
            return rows;

        } catch (error) {
            throw error;
        }
    }

    static async addTool(data: ProjectToolCreateData) {
        try {
            const validatedData = safeParse(ProjectToolCreate, data);
            if (!validatedData.success) throw new ValidationError();

            const rows = await sql`
                INSERT INTO project_tool ${sql(validatedData.output)} 
                RETURNING *`;

            return rows[0];

        } catch (error) {
            throw error;
        }
    }

    static async updateTool(project_id: number, tool_id: number, data: ProjectToolCreateData) {
        try {
            const validatedProjectId = safeParse(number(), project_id);
            const validatedToolId = safeParse(number(), tool_id);
            if (!validatedProjectId.success || !validatedToolId.success) throw new ValidationError();

            const validatedData = safeParse(ProjectToolCreate, data);
            if (!validatedData.success) throw new ValidationError();
            
            const rows = await sql`
                UPDATE project_tool SET ${sql(validatedData.output)}
                WHERE project_id = ${validatedProjectId.output} AND tool_id = ${validatedToolId.output}
                RETURNING *`;
            
            if(!rows.length) throw new NotFoundError();
            return rows[0];
            
        } catch (error) {
            throw error;
        }
    }

    static async removeTool(project_id: number, tool_id: number) {
        try {
            const validatedProjectId = safeParse(number(), project_id);
            const validatedToolId = safeParse(number(), tool_id);
            if (!validatedProjectId.success || !validatedToolId.success) throw new ValidationError();
            
            const rows = await sql`
                DELETE FROM project_tool
                WHERE project_id = ${validatedProjectId.output} AND tool_id = ${validatedToolId.output}
                RETURNING *`;
            
            if(!rows.length) throw new NotFoundError();
            return rows[0];

        } catch (error) {
            throw error;
        }
    }

    static async getComponents(project_id: number) {
        try {
            const validatedId = safeParse(number(), project_id);
            if (!validatedId.success) throw new ValidationError();
            
            const rows = await sql`
                SELECT pc.*, c.sku, c.name AS component_name, c.metric
                FROM project_component pc
                JOIN components c ON pc.component_id = c.id
                WHERE pc.project_id = ${validatedId.output}`;
            
            return rows;

        } catch (error) {
            throw error;
        }
    }

    static async addComponent(data: ProjectComponentCreateData) {
        try {
            const validatedData = safeParse(ProjectComponentCreate, data);
            if (!validatedData.success) throw new ValidationError();

            const rows = await sql`
                INSERT INTO project_component ${sql(validatedData.output)} 
                RETURNING *`;

            return rows[0];

        } catch (error) {
            throw error;
        }
    }

    static async updateComponent(project_id: number, component_id: number, data: ProjectComponentCreateData) {
        try {
            const validatedProjectId = safeParse(number(), project_id);
            const validatedComponentId = safeParse(number(), component_id);
            if (!validatedProjectId.success || !validatedComponentId.success) throw new ValidationError();

            const validatedData = safeParse(ProjectComponentCreate, data);
            if (!validatedData.success) throw new ValidationError();
            
            const rows = await sql`
                UPDATE project_component SET ${sql(validatedData.output)}
                WHERE project_id = ${validatedProjectId.output} AND component_id = ${validatedComponentId.output}
                RETURNING *`;
            
            if(!rows.length) throw new NotFoundError();
            return rows[0];
            
        } catch (error) {
            throw error;
        }
    }

    static async removeComponent(project_id: number, component_id: number) {
        try {
            const validatedProjectId = safeParse(number(), project_id);
            const validatedComponentId = safeParse(number(), component_id);
            if (!validatedProjectId.success || !validatedComponentId.success) throw new ValidationError();
            
            const rows = await sql`
                DELETE FROM project_component
                WHERE project_id = ${validatedProjectId.output} AND component_id = ${validatedComponentId.output}
                RETURNING *`;
            
            if(!rows.length) throw new NotFoundError();
            return rows[0];

        } catch (error) {
            throw error;
        }
    }
}
export default Project;
