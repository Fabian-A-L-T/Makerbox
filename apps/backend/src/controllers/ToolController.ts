import { type Request, type Response } from "express";
import Tool, { ToolQueryData } from "../models/Tool.js";
import { ValidationError, NotFoundError } from "../errors.js";

class ToolController {

    static async getAll(req: Request, res: Response){
        try {
            const { search, limit, offset, orderBy, desc, category, manufacturer } = req.query as ToolQueryData;
            const tools = await Tool.get({search, limit, offset, orderBy, desc, category, manufacturer });

            res.json(tools);

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Herramienta no encontrada', error: err.message });
            else res.status(500).json({ message: 'Error al obtener las herramientas', error: err.message });
        }
    }

    static async getByID(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const tool = await Tool.get({id: parseInt(id)});
            res.json(tool);

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Herramienta no encontrada', error: err.message });
            else res.status(500).json({ message: 'Error al obtener la herramienta', error: err.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const tool = await Tool.create(req.body);
            res.status(201).json({ message: 'Herramienta creada exitosamente', data: tool });

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else res.status(500).json({ message: 'Error al crear la herramienta', error: err.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const tool = await Tool.update(parseInt(id), req.body);
            res.json({ message: 'Herramienta actualizada exitosamente', data: tool });

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Herramienta no encontrada', error: err.message });
            else res.status(500).json({ message: 'Error al actualizar la herramienta', error: err.message });
        }
    }
    
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const tool = await Tool.delete(parseInt(id));
            res.json({ message: 'Herramienta eliminada exitosamente', data: tool });

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Herramienta no encontrada', error: err.message });
            else res.status(500).json({ message: 'Error al eliminar la herramienta', error: err.message });
        }
    }
}
export default ToolController;
