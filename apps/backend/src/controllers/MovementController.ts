import { type Request, type Response } from "express";
import Movement from "../models/Movement.js";
import { ValidationError, NotFoundError } from "../errors.js";

class MovementController {

    static async getAll(req: Request, res: Response) {
        try {
            const { limit, offset, orderBy, desc} = req.query;
            const movimientos = await Movement.get({ limit: parseInt(limit as string), offset: parseInt(offset as string), orderBy: orderBy as string, desc: desc === 'true' });
            res.json(movimientos);

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener los movimientos de stock', error: err.message });
        }
    }

    static async getByID(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const movimiento = await Movement.get({id: parseInt(id)});
            res.json(movimiento);

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener el movimiento', error: err.message });
        }
    }
    
    static async create(req: Request, res: Response) {
        try {
            const nuevo = await Movement.create(req.body);
            res.status(201).json({ message: 'Movimiento registrado exitosamente', data: nuevo[0] });

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al registrar el movimiento', error: err.message });
        }
    }
}

export default MovementController;
