import { type Request, type Response } from "express";
import Movement from "../models/Movement.js";
import { ValidationError, HttpError } from "../utils/errors.js";
import { number, safeParse } from "valibot";
import { movementFilterSchema, movementSchema, paginationSchema } from "../utils/schemas.js";
import { generatePagination } from "../utils/utils.js";
import sql from "../config/database.js";

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
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
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
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }
    
    static async create(req: Request, res: Response) {
        try {
            const validatedData = safeParse(movementSchema, req.body);
            if (!validatedData.success) throw new ValidationError();

            const movement = await Movement.create(validatedData.output);
            res.status(201).json({ message: 'Movimiento registrado exitosamente', data: movement });
        }
        catch (error: any) {
            const status = error instanceof HttpError 
                ? error.statusCode 
                : error instanceof sql.PostgresError && error.code === 'P0001' || error.code === '23514' 
                    ? 422
                    : 500;
            if(error instanceof sql.PostgresError) {
                if(error.code === 'P0001') error.message = 'No se puede realizar el movimiento con la cantidad especificada';
                else if( error.code === '23514') error.message = 'Existen datos faltantes';
            }
            res.status(status).json({ message: error.message });
        }
    }
}
