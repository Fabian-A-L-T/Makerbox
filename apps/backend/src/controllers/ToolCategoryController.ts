import { type Request, type Response } from "express";
import Category from "../models/ToolCategory.js";
import { ValidationError, NotFoundError } from "../errors.js";
import {type CategoryQueryData } from "../models/Category.js";

class ToolCategoryController {

    static async getAll(req: Request, res: Response) {
        try {
            const {search, limit, offset, orderBy, orderDir } = req.query as CategoryQueryData;
            const categories = await Category.get({ search, limit, offset, orderBy, orderDir });
            res.json(categories);

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error al obtener las categorías', error: err.message });
            else res.status(500).json({ message: 'Error al obtener las categorías', error: err.message });
        }
    }

    static async getByID(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const category = await Category.get({ id: parseInt(id) });
            res.json(category);

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error al obtener la categoría', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Categoría no encontrada' });
            else res.status(500).json({ message: 'Error al obtener la categoría', error: err.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const category = await Category.create(req.body);
            res.status(201).json({ message: 'Categoría creada exitosamente', data: category });

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error al crear la categoría', error: err.message });
            else res.status(500).json({ message: 'Error al crear la categoría', error: err.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const category = await Category.update(parseInt(id), req.body);
            res.json({ message: 'Categoría actualizada exitosamente', data: category });

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error al actualizar la categoría', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Categoría no encontrada' });
            else res.status(500).json({ message: 'Error al actualizar la categoría', error: err.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const category = await Category.delete(parseInt(id));
            res.json({ message: 'Categoría eliminada exitosamente', data: category });
            
        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error al eliminar la categoría', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Categoría no encontrada' });
            else res.status(500).json({ message: 'Error al eliminar la categoría', error: err.message });
        }
    }

    static async getChildren(req: Request, res: Response) {
        try {
            const path = req.query.path as string | undefined;
            const categories = await Category.getChildren(path);
            res.json(categories);
            
        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error al obtener las categorías', error: err.message });
            else res.status(500).json({ message: 'Error al obtener las categorías', error: err.message });
        }
    }
}

export default ToolCategoryController;
