import { type Request, type Response } from "express";
import Project from "../models/Project.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import { paginationSchema, projectComponentSchema, projectFilterSchema, projectSchema, projectToolSchema } from "../utils/schemas.js";
import { number, safeParse } from "valibot";
import { generatePagination } from "../utils/utils.js";

export default class ProjectController {
    static async getAll(req: Request, res: Response) {
        try {
            const { userId, search, limit, offset, orderBy, desc, state } = req.query;

            const validatedPagination = safeParse(paginationSchema, {limit, offset});
            if(!validatedPagination.success) throw new ValidationError();

            const validatedFilters = safeParse(projectFilterSchema, {search, orderBy, desc, userId, state});
            if(!validatedFilters.success) throw new ValidationError();

            const projects = await Project.get({...validatedPagination.output, ...validatedFilters.output});
            res.json(await generatePagination({
                content: projects,
                tableName: 'projects',
                hasSoftDelete: true,
                resourceRoute: 'projects',
                ...(validatedPagination.output),
                otherParams: validatedFilters.output
            }));
        }
        catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener los proyectos', error: err.message });
        }
    }

    static async getByID(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if (!validatedId.success) throw new ValidationError();

            const project = await Project.getById(validatedId.output);
            res.json({content: project});
        }
        catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener el proyecto', error: err.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const validatedData = safeParse(projectSchema, req.body);
            if (!validatedData.success) throw new ValidationError();

            const project = await Project.create(validatedData.output);
            res.status(201).json({ message: 'Proyecto creado exitosamente', data: project});
        }
        catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al crear el proyecto', error: err.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if (!validatedId.success) throw new ValidationError();

            const validatedData = safeParse(projectSchema, req.body);
            if (!validatedData.success) throw new ValidationError();

            const actualizado = await Project.update(validatedId.output, validatedData.output);
            res.json({ message: 'Proyecto actualizado exitosamente', data: actualizado });
        }
        catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al actualizar el proyecto', error: err.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if (!validatedId.success) throw new ValidationError();

            const project = await Project.delete(validatedId.output);
            res.json({ message: 'Proyecto eliminado exitosamente', data: project });
        }
        catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al eliminar el proyecto', error: err.message });
        }
    }

    static async getProjectTools(req: Request, res: Response) {
        try {
            const { project_id } = req.params;

            const validatedId = safeParse(number(), parseInt(project_id));
            if (!validatedId.success) throw new ValidationError();

            const rows = await Project.getTools(validatedId.output);
            res.json({content: rows});
        }
        catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener las herramientas del proyecto', error: err.message });
        }
    }

    static async addTool(req: Request, res: Response) {
        try {
            const { project_id } = req.params;

            const validatedData = safeParse(projectToolSchema, {...req.body, project_id});
            if (!validatedData.success) throw new ValidationError();

            const nuevo = await Project.addTool(validatedData.output);
            res.status(201).json({ message: 'Herramienta asignada al proyecto', data: nuevo });
        }
        catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al asignar la herramienta al proyecto', error: err.message });
        }
    }

    static async updateTool(req: Request, res: Response) {
        try {
            const {project_id, tool_id} = req.params;

            const validatedData = safeParse(projectToolSchema, {...req.body, project_id: parseInt(project_id), tool_id: parseInt(tool_id)});
            if (!validatedData.success) throw new ValidationError();

            const projectTool = await Project.updateTool(validatedData.output);
            res.json({ message: 'Asignación actualizada exitosamente', data: projectTool }); 
        }
        catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al actualizar la asignación', error: err.message });
        }
    }

    static async removeTool(req: Request, res: Response) {
        try {
            const {project_id, tool_id} = req.params;

            const validatedProjectId = safeParse(number(), parseInt(project_id));
            const validatedToolId = safeParse(number(), parseInt(tool_id));
            if (!validatedProjectId.success || !validatedToolId.success) throw new ValidationError();

            const projectTool = await Project.removeTool(validatedProjectId.output, validatedToolId.output);
            res.json({ message: 'Herramienta desasignada del proyecto', data: projectTool });
        }
        catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al desasignar la herramienta', error: err.message });
        }
    }

    static async getProjectComponents(req: Request, res: Response) {
        try {
            const { project_id } = req.params;

            const validatedId = safeParse(number(), parseInt(project_id));
            if (!validatedId.success) throw new ValidationError();

            const rows = await Project.getComponents(validatedId.output);
            res.json({content: rows});
        }
        catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener los componentes del proyecto', error: err.message });
        }
    }

    static async addComponent(req: Request, res: Response) {
        try {
            const { project_id } = req.params;

            const validatedData = safeParse(projectComponentSchema, { ...req.body, project_id });
            if (!validatedData.success) throw new ValidationError();

            const projectComponent = await Project.addComponent(validatedData.output);
            res.status(201).json({ message: 'Componente añadido al proyecto', data: projectComponent }); 
        }
        catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al añadir el componente al proyecto', error: err.message });
        }
    }

    static async updateComponent(req: Request, res: Response) {
        try {
            const { project_id, component_id } = req.params;

            const validatedData = safeParse(projectComponentSchema, {...req.body, project_id: parseInt(project_id), component_id: parseInt(component_id)});
            if (!validatedData.success) throw new ValidationError();

            const projectComponent = await Project.updateComponent(validatedData.output);
            res.json({ message: 'Componente del proyecto actualizado exitosamente', data: projectComponent });  
        }
        catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al actualizar el componente del proyecto', error: err.message });
        }
    }
    
    static async removeComponent(req: Request, res: Response) {
        try {
            const { project_id, component_id } = req.params;

            const validatedProjectId = safeParse(number(), parseInt(project_id));
            const validatedComponentId = safeParse(number(), parseInt(component_id));
            if (!validatedProjectId.success || !validatedComponentId.success) throw new ValidationError();

            const projectComponent = await Project.removeComponent(validatedProjectId.output, validatedComponentId.output);
            res.json({ message: 'Componente eliminado del proyecto', data: projectComponent });
        }
        catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al eliminar el componente del proyecto', error: err.message });
        }
    }
}
