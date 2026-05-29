import { type Request, type Response } from "express";
import Manufacturer from "../models/Manufacturer.js";
import { ValidationError, NotFoundError } from "../errors.js";

class ManufacturerController {

    static async getAll(_req: Request, res: Response) {
        try {
            const manufacturers = await Manufacturer.get();
            res.json(manufacturers);

        } catch (err: any) {
            if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener los fabricantes', error: err.message });
        }
    }

    static async getByID(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const manufacturer = await Manufacturer.get(parseInt(id));
            res.json(manufacturer);

        } catch (err: any) {
            if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) return res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener el fabricante', error: err.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const manufacturer = await Manufacturer.create(req.body);
            res.status(201).json({ message: 'Fabricante creado exitosamente', data: manufacturer });

        } catch (err: any) {
            if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al crear el fabricante', error: err.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updated = await Manufacturer.update(parseInt(id), req.body);
            res.json({ message: 'Fabricante actualizado exitosamente', data: updated });
            
        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al actualizar el fabricante', error: err.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const eliminado = await Manufacturer.delete(parseInt(id));
            res.json({ message: 'Fabricante eliminado exitosamente', data: eliminado });

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al eliminar el fabricante', error: err.message });
        }
    }
}

export default ManufacturerController;
