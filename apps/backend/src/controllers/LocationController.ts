import { type Request, type Response } from "express";
import Location from "../models/Location.js";
import { HttpError, ValidationError } from "../utils/errors.js";
import { locationFilterSchema, locationSchema, paginationSchema } from "../utils/schemas.js";
import { number, safeParse } from "valibot";
import { generatePagination } from "../utils/utils.js";

export default class LocationController {
    static async getAll(req: Request, res: Response) {
        try {
            const { search, limit, offset, orderBy, desc, exclude } = req.query;

            const validatedPagination = safeParse(paginationSchema, {limit, offset});
            if(!validatedPagination.success) throw new ValidationError();

            const validatedFilters = safeParse(locationFilterSchema, {search, orderBy, desc, exclude});
            if(!validatedFilters.success) throw new ValidationError();

            const locations = await Location.get({...validatedPagination.output, ...validatedFilters.output});
            res.json(await generatePagination({
                content: locations,
                tableName: 'locations',
                hasSoftDelete: true,
                resourceRoute: 'locations',
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

            const location = await Location.getById(validatedId.output);
            res.json({content: location});
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        } 
    }

    static async create(req: Request, res: Response) {
       try {
            const validatedData = safeParse(locationSchema, req.body);
            if (!validatedData.success) throw new ValidationError();

            const location = await Location.create(validatedData.output);
            res.status(201).json({ message: 'Ubicación creada exitosamente', data: location[0] });

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
            
            const validatedData = safeParse(locationSchema, req.body);
            if (!validatedData.success) throw new ValidationError();

            const location = await Location.update(validatedId.output, validatedData.output);
            res.json({ message: 'Ubicación actualizada exitosamente', data: location[0] });
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

            const location = await Location.delete(validatedId.output);
            res.json({ message: 'Ubicación eliminada exitosamente', data: location[0] });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async getComponents(req: Request, res: Response) {
        try {
            const { location_id } = req.params;

            const validatedId = safeParse(number(), parseInt(location_id));
            if (!validatedId.success) throw new ValidationError();

            const components = await Location.getComponents(validatedId.output);
            res.json({content: components});
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }
}
