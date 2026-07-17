import { type Request, type Response } from "express";
import Tool from "../models/Tool.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import { number, safeParse } from "valibot";
import { paginationSchema, toolFilterSchema, toolSchema } from "../utils/schemas.js";
import { generatePagination } from "../utils/utils.js";

export default class ToolController {
    static async getAll(req: Request, res: Response){
        try {
            const { search, limit, offset, orderBy, desc, category, manufacturer, state } = req.query;

            const validatedPagination = safeParse(paginationSchema, {limit, offset});
            if(!validatedPagination.success) throw new ValidationError();

            const validatedFilters = safeParse(toolFilterSchema, { search, orderBy, desc, category, manufacturer, state });
            if (validatedFilters.issues) throw new ValidationError();

            const tools = await Tool.get({...validatedPagination.output, ...validatedFilters.output});
            res.json(await generatePagination({
                content: tools,
                tableName: 'tools',
                hasSoftDelete: true,
                resourceRoute: 'tools',
                ...(validatedPagination.output),
                otherParams: {...validatedFilters.output, 
                    category: validatedFilters.output.category?.toString(), 
                    manufacturer: validatedFilters.output.manufacturer?.toString()
                }
            }));
        }
        catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Herramienta no encontrada', error: err.message });
            else res.status(500).json({ message: 'Error al obtener las herramientas', error: err.message });
        }
    }

    static async getByID(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const validatedId = safeParse(number(), parseInt(id));
            if (!validatedId.success) throw new ValidationError();

            const tool = await Tool.getById(validatedId.output);
            res.json({content: tool});
        }
        catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Herramienta no encontrada', error: err.message });
            else res.status(500).json({ message: 'Error al obtener la herramienta', error: err.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const validatedData = safeParse(toolSchema, req.body);
            if (!validatedData.success) throw new ValidationError();

            const tool = await Tool.create(validatedData.output);
            res.status(201).json({ message: 'Herramienta creada exitosamente', data: tool });
        }
        catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else res.status(500).json({ message: 'Error al crear la herramienta', error: err.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();
            
            const validatedData = safeParse(toolSchema, req.body);
            if(!validatedData.success) throw new ValidationError();

            const tool = await Tool.update(validatedId.output, validatedData.output);
            res.json({ message: 'Herramienta actualizada exitosamente', data: tool });
        }
        catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Herramienta no encontrada', error: err.message });
            else res.status(500).json({ message: 'Error al actualizar la herramienta', error: err.message });
        }
    }
    
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();

            const tool = await Tool.delete(validatedId.output);
            res.json({ message: 'Herramienta eliminada exitosamente', data: tool });
        }
        catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Herramienta no encontrada', error: err.message });
            else res.status(500).json({ message: 'Error al eliminar la herramienta', error: err.message });
        }
    }
}
