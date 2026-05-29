import sql from "../config/database.js";
import { safeParse, number } from "valibot";
import { ValidationError, NotFoundError } from "../errors.js";
import { ProjectCreate, type ProjectCreateData, ProjectStatusSchema, type ProjectToolCreateData, ProjectToolCreate, type ProjectComponentCreateData, ProjectComponentCreate } from "./schemas.js";

class Project {

    static async get({estado, id}: {estado?: string, id?: number}) {
        try {
            if (id) {
                const validatedId = safeParse(number(), id);
                if (!validatedId.success) throw new ValidationError();

                const project = await sql`
                    SELECT p.*, u.name AS username
                    FROM projects p
                    LEFT JOIN users u ON p.user_id = u.id
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
                let estadoValue = null;
                if (estado) {
                    const validatedEstado = safeParse(ProjectStatusSchema, estado);
                    if (!validatedEstado.success) throw new ValidationError();
                    estadoValue = validatedEstado.output;
                }
                return await sql`
                    SELECT p.*, u.name AS username
                    FROM projects p
                    LEFT JOIN users u ON p.user_id = u.id
                    ${estado ? sql`WHERE p.estado = ${estado}` : sql``}
                    ORDER BY p.created_at DESC`;
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
            if (!validatedData.success) throw new ValidationError();
            
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
