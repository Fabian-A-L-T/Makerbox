import { type Request, type Response } from "express";
import Movement from "../models/Movement.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import { number, safeParse } from "valibot";
import { movementFilterSchema, movementSchema, paginationSchema } from "../utils/schemas.js";
import { generatePagination } from "../utils/utils.js";

export default class MovementController {
    static async getAll(req: Request, res: Response) {
        try {
            const { limit, offset, orderBy, search, desc} = req.query;

            const validatedPagination = safeParse(paginationSchema, {limit, offset});
            if(!validatedPagination.success) throw new ValidationError();

            const validatedFilters = safeParse(movementFilterSchema, {search, orderBy, desc});
            if(!validatedFilters.success) throw new ValidationError();

            const movements = await Movement.get({...validatedPagination.output, ...validatedFilters.output});
            res.json(await generatePagination({
                content: movements,
                tableName: 'stock_movements',
                hasSoftDelete: false,
                resourceRoute: 'movements',
                ...(validatedPagination.output),
                otherParams: validatedFilters.output
            }));
        }
        catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener los movimientos de stock', error: err.message });
        }
    }

    static async getByID(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedID = safeParse(number(), parseInt(id));
            if (!validatedID.success) throw new ValidationError();

            const movement = await Movement.getById(validatedID.output);
            res.json({content: movement});
        }
        catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener el movimiento', error: err.message });
        }
    }
    
    static async create(req: Request, res: Response) {
        try {
            const validatedData = safeParse(movementSchema, req.body);
            if (!validatedData.success) throw new ValidationError();

            const movement = await Movement.create(validatedData.output);
            res.status(201).json({ message: 'Movimiento registrado exitosamente', data: movement });
        }
        catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al registrar el movimiento', error: err.message });
        }
    }
}
