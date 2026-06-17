import { type Request, type Response } from "express";
import Project, { ProjectQueryData } from "../models/Project.js";
import { ValidationError, NotFoundError } from "../errors.js";

class ProjectController {

    static async getAll(req: Request, res: Response) {
        try {
            const { id, userId, search, limit, offset, orderBy, desc } = req.query as ProjectQueryData;
            const projects = await Project.get({ id, userId, search, limit, offset, orderBy, desc });
            res.json(projects);

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener los proyectos', error: err.message });
        }
    }

    static async getByID(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const project = await Project.get({id: parseInt(id)});
            res.json(project);

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener el proyecto', error: err.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const project = await Project.create(req.body);
            res.status(201).json({ message: 'Proyecto creado exitosamente', data: project});

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al crear el proyecto', error: err.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const actualizado = await Project.update(parseInt(id), req.body);
            res.json({ message: 'Proyecto actualizado exitosamente', data: actualizado });

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al actualizar el proyecto', error: err.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const project = await Project.delete(parseInt(id));
            res.json({ message: 'Proyecto eliminado exitosamente', data: project });

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al eliminar el proyecto', error: err.message });
        }
    }

    static async getProjectTools(req: Request, res: Response) {
        try {
            const { project_id } = req.params;
            const rows = await Project.getTools(parseInt(project_id));
            res.json(rows);

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener las herramientas del proyecto', error: err.message });
        }
    }

    static async addTool(req: Request, res: Response) {
        try {
            const {project_id} = req.params;
            const data = {...req.body, proyecto_id: project_id};
            const nuevo = await Project.addTool(data);
            res.status(201).json({ message: 'Herramienta asignada al proyecto', data: nuevo });

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al asignar la herramienta al proyecto', error: err.message });
        }
    }

    static async updateTool(req: Request, res: Response) {
        try {
            const {project_id, tool_id} = req.params;
            const projectTool = await Project.updateTool(parseInt(project_id), parseInt(tool_id), req.body);
            res.json({ message: 'Asignación actualizada exitosamente', data: projectTool });
            
        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al actualizar la asignación', error: err.message });
        }
    }

    static async removeTool(req: Request, res: Response) {
        try {
            const {project_id, tool_id} = req.params;
            const projectTool = await Project.removeTool(parseInt(project_id), parseInt(tool_id));
            res.json({ message: 'Herramienta desasignada del proyecto', data: projectTool });

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al desasignar la herramienta', error: err.message });
        }
    }

    static async getProjectComponents(req: Request, res: Response) {
        try {
            const { project_id } = req.params;
            const rows = await Project.getComponents(parseInt(project_id));
            res.json(rows);

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener los componentes del proyecto', error: err.message });
        }
    }

    static async addComponent(req: Request, res: Response) {
        try {
            const { project_id } = req.params;
            const data = { ...req.body, proyecto_id: project_id };
            const projectComponent = await Project.addComponent(data);
            res.status(201).json({ message: 'Componente añadido al proyecto', data: projectComponent });
            
        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al añadir el componente al proyecto', error: err.message });
        }
    }

    static async updateComponent(req: Request, res: Response) {
        try {
            const { project_id, component_id } = req.params;
            const projectComponent = await Project.updateComponent(parseInt(project_id), parseInt(component_id), req.body);
            res.json({ message: 'Componente del proyecto actualizado exitosamente', data: projectComponent });
            
        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al actualizar el componente del proyecto', error: err.message });
        }
    }
    
    static async removeComponent(req: Request, res: Response) {
        try {
            const { project_id, component_id } = req.params;
            const projectComponent = await Project.removeComponent(parseInt(project_id), parseInt(component_id));
            res.json({ message: 'Componente eliminado del proyecto', data: projectComponent });

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al eliminar el componente del proyecto', error: err.message });
        }
    }
}
export default ProjectController;
