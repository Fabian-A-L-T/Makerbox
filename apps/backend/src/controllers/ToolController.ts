import { type Request, type Response } from "express";
import Tool from "../models/Tool.js";
import { ValidationError, HttpError } from "../utils/errors.js";
import { number, safeParse } from "valibot";
import { paginationSchema, toolFilterSchema, toolSchema } from "../utils/schemas.js";
import { generatePagination } from "../utils/utils.js";
import sql from "../config/database.js";

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
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
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
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const validatedData = safeParse(toolSchema, req.body);
            if (!validatedData.success) throw new ValidationError();

            const tool = await Tool.create(validatedData.output);
            res.status(201).json({ message: 'Herramienta creada exitosamente', data: tool[0] });
        }
        catch (error: any) {
            let postgresMessage = '';
            const status = error instanceof HttpError 
                ? error.statusCode 
                : error instanceof sql.PostgresError && error.code === '23505' 
                    ? 409
                    : 500;
            if(error instanceof sql.PostgresError) {
                if(error.constraint_name === 'tools_serial_number_key') postgresMessage = 'Numero de serie duplicado';
                else postgresMessage = 'SKU duplicado';
            }
            res.status(status).json({ message: status === 409 ? postgresMessage : error.message });
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
            res.json({ message: 'Herramienta actualizada exitosamente', data: tool[0] });
        }
        catch (error: any) {
            const status = error instanceof HttpError 
                ? error.statusCode 
                : error instanceof sql.PostgresError && error.code === '23505' 
                    ? 409
                    : 500;
            if(error instanceof sql.PostgresError) {
                if(error.constraint_name === 'tools_serial_number_key') error.message = 'Numero de serie duplicado';
                else error.message = 'SKU duplicado';
            }
            res.status(status).json({ message: error.message });
        }
    }
    
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();

            const tool = await Tool.delete(validatedId.output);
            res.json({ message: 'Herramienta eliminada exitosamente', data: tool[0] });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async restore(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();

            const tool = await Tool.restore(validatedId.output);
            res.json({ message: "Herramienta restaurado exitosamente", data: tool });

        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }
}
