import { type Request, type Response } from "express";
import Manufacturer from "../models/Manufacturer.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
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
        catch (err: any) {
            if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener los fabricantes', error: err.message });
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
        catch (err: any) {
            if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) return res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener el fabricante', error: err.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const validatedData = safeParse(manufacturerSchema, req.body);
            if (!validatedData.success) throw new ValidationError();

            const manufacturer = await Manufacturer.create(validatedData.output);
            res.status(201).json({ message: 'Fabricante creado exitosamente', data: manufacturer });
        } 
        catch (err: any) {
            if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al crear el fabricante', error: err.message });
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
        catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al actualizar el fabricante', error: err.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if (!validatedId.success) throw new ValidationError();

            const eliminado = await Manufacturer.delete(validatedId.output);
            res.json({ message: 'Fabricante eliminado exitosamente', data: eliminado });

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al eliminar el fabricante', error: err.message });
        }
    }
}
