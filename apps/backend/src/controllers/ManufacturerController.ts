import { type Request, type Response } from "express";
import Manufacturer from "../models/Manufacturer.js";
import { ValidationError, HttpError } from "../utils/errors.js";
import { number, safeParse } from "valibot";
import { manufacturerFilterSchema, manufacturerSchema, paginationSchema } from "../utils/schemas.js";
import { generatePagination } from "../utils/utils.js";

export default class ManufacturerController {
    static async getAll(req: Request, res: Response) {
        try {
            const {search, limit, offset, orderBy, desc, exclude } = req.query;
            
            const validatedPagination = safeParse(paginationSchema, {limit, offset});
            if(!validatedPagination.success) throw new ValidationError();

            const validatedFilters = safeParse(manufacturerFilterSchema, {search, orderBy, desc, exclude});
            if(!validatedFilters.success) throw new ValidationError();

            const manufacturers = await Manufacturer.get({...validatedPagination.output, ...validatedFilters.output});
            res.json(await generatePagination({
                content: manufacturers,
                tableName: 'manufacturers',
                hasSoftDelete: true,
                resourceRoute: 'manufacturers',
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
            if (!validatedId.success) throw new ValidationError();

            const manufacturer = await Manufacturer.getById(validatedId.output);
            res.json({content: manufacturer});
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const validatedData = safeParse(manufacturerSchema, req.body);
            if (!validatedData.success) throw new ValidationError();

            const manufacturer = await Manufacturer.create(validatedData.output);
            res.status(201).json({ message: 'Fabricante creado exitosamente', data: manufacturer });
        } 
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if (!validatedId.success) throw new ValidationError();

            const validatedData = safeParse(manufacturerSchema, req.body);
            if (!validatedData.success) throw new ValidationError();

            const updated = await Manufacturer.update(validatedId.output, validatedData.output);
            res.json({ message: 'Fabricante actualizado exitosamente', data: updated });  
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if (!validatedId.success) throw new ValidationError();

            const eliminado = await Manufacturer.delete(validatedId.output);
            res.json({ message: 'Fabricante eliminado exitosamente', data: eliminado });

        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }
}
