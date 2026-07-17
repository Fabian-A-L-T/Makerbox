import { type Request, type Response } from "express";
import Category from "../models/ToolCategory.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import { generatePagination } from "../utils/utils.js";
import { safeParse, number, string, optional } from 'valibot';
import { categoryFilterSchema, categorySchema, paginationSchema } from "../utils/schemas.js";

export default class ToolCategoryController {
    static async getAll(req: Request, res: Response) {
        try {
            const {search, limit, offset, orderBy, desc, exclude } = req.query;

            const validatedPagination = safeParse(paginationSchema, {limit, offset});
            if(!validatedPagination.success) throw new ValidationError();

            const validatedFilters = safeParse(categoryFilterSchema, {search, orderBy, desc, exclude});
            if(!validatedFilters.success) throw new ValidationError();

            const categories = await Category.get({...validatedPagination.output, ...validatedFilters.output});
            res.json(await generatePagination({
                content: categories,
                tableName: 'tool_categories',
                hasSoftDelete: true,
                resourceRoute: 'tool-categories',
                ...(validatedPagination.output),
                otherParams: validatedFilters.output
            }));
        } 
        catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error al obtener las categorías', error: err.message });
            else res.status(500).json({ message: 'Error al obtener las categorías', error: err.message });
        }
    }

    static async getByID(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();
            
            const category = await Category.getById(validatedId.output);
            res.json({content: category});
        } 
        catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error al obtener la categoría', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Categoría no encontrada' });
            else res.status(500).json({ message: 'Error al obtener la categoría', error: err.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const validatedData = safeParse(categorySchema, req.body);
            if(!validatedData.success) throw validatedData.issues;

            const category = await Category.create(validatedData.output);
            res.status(201).json({ message: 'Categoría creada exitosamente', data: category });
        } 
        catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error al crear la categoría', error: err.message });
            else res.status(500).json({ message: 'Error al crear la categoría', error: err.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();

            const validatedData = safeParse(categorySchema, req.body);
            if(!validatedData.success) throw validatedData.issues;

            const category = await Category.update(validatedId.output, validatedData.output);
            res.json({ message: 'Categoría actualizada exitosamente', data: category });
        } 
        catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error al actualizar la categoría', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Categoría no encontrada' });
            else res.status(500).json({ message: 'Error al actualizar la categoría', error: err.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();

            const category = await Category.delete(validatedId.output);
            res.json({ message: 'Categoría eliminada exitosamente', data: category });
        } 
        catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error al eliminar la categoría', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Categoría no encontrada' });
            else res.status(500).json({ message: 'Error al eliminar la categoría', error: err.message });
        }
    }

    static async getChildren(req: Request, res: Response) {
        try {
            const { path } = req.query;

            const validatedPath = safeParse(optional(string()), path);
            if(!validatedPath.success) throw new ValidationError();

            const categories = await Category.getChildren(validatedPath.output);
            res.json(categories);
        } 
        catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error al obtener las categorías', error: err.message });
            else res.status(500).json({ message: 'Error al obtener las categorías', error: err.message });
        }
    }
}
