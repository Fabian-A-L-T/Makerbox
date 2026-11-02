import { type Request, type Response } from "express";
import Category from "../models/ToolCategory.js";
import { ValidationError, HttpError } from "../utils/errors.js";
import { generatePagination } from "../utils/utils.js";
import { safeParse, number, string, optional } from 'valibot';
import { categoryFilterSchema, categorySchema, paginationSchema } from "../utils/schemas.js";
import sql from "../config/database.js";

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
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
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
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const validatedData = safeParse(categorySchema, req.body);
            if(!validatedData.success) throw new ValidationError();

            const category = await Category.create(validatedData.output);
            res.status(201).json({ message: 'Categoría creada exitosamente', data: category });
        } 
        catch (error: any) {
            const status = error instanceof HttpError 
                ? error.statusCode 
                : error instanceof sql.PostgresError && error.code === '23505' 
                    ? 409
                    : 500;
            res.status(status).json({ message: status === 409 ? 'Esta categoría ya existe' : error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();

            const validatedData = safeParse(categorySchema, req.body);
            if(!validatedData.success) throw new ValidationError();

            const category = await Category.update(validatedId.output, validatedData.output);
            res.json({ message: 'Categoría actualizada exitosamente', data: category });
        } 
        catch (error: any) {
            const status = error instanceof HttpError 
                ? error.statusCode 
                : error instanceof sql.PostgresError && error.code === '23505' 
                    ? 409
                    : 500;
            res.status(status).json({ message: status === 409 ? 'Esta categoría ya existe' : error.message });
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
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async getChildren(req: Request, res: Response) {
        try {
            const { path } = req.query;

            const validatedPath = safeParse(optional(string()), path);
            if(!validatedPath.success) throw new ValidationError();

            const categories = await Category.getChildren(validatedPath.output);
            res.json({content: categories});
        } 
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }
}
