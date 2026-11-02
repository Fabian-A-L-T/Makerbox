import { type Request, type Response } from "express";
import Component from "../models/Component.js";
import { ValidationError, HttpError } from "../utils/errors.js";
import { number, object, optional, safeParse } from "valibot";
import { componentFilterSchema, componentSchema, paginationSchema } from "../utils/schemas.js";
import { generatePagination } from "../utils/utils.js";
import sql from "../config/database.js";

export default class ComponentController {
    static async getAll(req: Request, res: Response) {
        try {
            const { search, limit, offset, orderBy, desc, category, manufacturer } = req.query;

            const validatedPagination = safeParse(paginationSchema, {limit, offset});
            if(!validatedPagination.success) throw new ValidationError();

            const validatedFilters = safeParse(componentFilterSchema, { search, orderBy, desc, category, manufacturer });
            if (validatedFilters.issues) throw new ValidationError();

            const components = await Component.get({...validatedPagination.output, ...validatedFilters.output});
            res.json(await generatePagination({
                content: components,
                tableName: 'components',
                hasSoftDelete: true,
                resourceRoute: 'components',
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

            const component = await Component.getById(validatedId.output);
            res.json({content: component});

        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const validatedData = safeParse(componentSchema, req.body);
            if(!validatedData.success) throw new ValidationError();

            const newComponent = await Component.create(validatedData.output);
            res.status(201).json({ message: "Componente creado exitosamente", data: newComponent });

        }
        catch (error: any) {
            const status = error instanceof HttpError 
                ? error.statusCode 
                : error instanceof sql.PostgresError && error.code === '23505' 
                    ? 409
                    : 500;
            res.status(status).json({ message: status === 409 ? 'El SKU debe ser único' : error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();
    
            const validatedData = safeParse(componentSchema, req.body);
            if(!validatedData.success) throw new ValidationError();

            const updatedComponent = await Component.update(validatedId.output, validatedData.output);
            res.json({ message: "Componente actualizado exitosamente", data: updatedComponent });

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

            const component = await Component.restore(validatedId.output);
            res.json({ message: "Componente restaurado exitosamente", data: component });

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
            if(!validatedId.success) throw new ValidationError();

            const component = await Component.delete(validatedId.output);
            res.json({ message: "Componente eliminado exitosamente", data: component });

        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async getLocation(req: Request, res: Response) {
        try {
            const validatedIds = safeParse(object({
                component_id: number(),
                location_id: optional(number())
            }), {
                component_id: parseInt(req.params.component_id),
                location_id: parseInt(req.params.location_id)
            });
            if(!validatedIds.success) throw new ValidationError();

            const location = await Component.getLocations(validatedIds.output);
            res.json({content: location});

        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async getAllLocations(req: Request, res: Response) {
        try {
            const { component_id } = req.params;

            const validatedId = safeParse(number(), parseInt(component_id));
            if(!validatedId.success) throw new ValidationError();

            const rows = await Component.getAllLocations(validatedId.output);
            res.json({content: rows});

        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }
    
    static async addToLocation(req: Request, res: Response) {
        try {
            const { component_id } = req.params;
            const { location_id, amount } = req.body;
            const validatedComponentId = safeParse(number(), parseInt(component_id));
            const validatedLocationId = safeParse(number(), location_id);
            const validatedQuantity = safeParse(number(), amount);
            if(!validatedComponentId.success || !validatedLocationId.success || !validatedQuantity.success) throw new ValidationError();

            const nuevo = await Component.addToLocation(validatedComponentId.output, validatedLocationId.output, validatedQuantity.output);
            res.status(201).json({ message: 'Asignación creada exitosamente', data: nuevo });

        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async updateQuantity(req: Request, res: Response) {
        try {
            const { component_id, location_id } = req.params;
            const { amount } = req.body;

            const validatedComponentId = safeParse(number(), parseInt(component_id));
            const validatedLocationId = safeParse(number(), parseInt(location_id));
            const validatedAmount = safeParse(number(), amount);
            if(!validatedComponentId.success || !validatedLocationId.success || !validatedAmount.success) throw new ValidationError();
            
            const actualizado = await Component.updateQuantity(validatedComponentId.output, validatedLocationId.output, validatedAmount.output);
            res.json({ message: 'Cantidad actualizada exitosamente', data: actualizado });

        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async removeFromLocation(req: Request, res: Response) {
        try {
            const { component_id, location_id } = req.params;

            const validatedComponentId = safeParse(number(), parseInt(component_id));
            const validatedLocationId = safeParse(number(), parseInt(location_id));
            if(!validatedComponentId.success || !validatedLocationId.success) throw new ValidationError();

            const eliminado = await Component.removeFromLocation(validatedComponentId.output, validatedLocationId.output);
            res.json({ message: 'Asignación eliminada exitosamente', data: eliminado });

        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }
}
