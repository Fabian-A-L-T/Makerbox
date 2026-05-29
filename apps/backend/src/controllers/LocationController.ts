import { type Request, type Response } from "express";
import Location from "../models/Location.js";
import { NotFoundError, ValidationError } from "../errors.js";
import {type LocationQueryData } from "../models/Location.js";

class LocationController {

    static async getAll(req: Request, res: Response) {
        try {
            const { search, limit, offset, orderBy, orderDir } = req.query as LocationQueryData;
            const locations = await Location.get({ search, limit, offset, orderBy, orderDir });
            res.json(locations);

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener las ubicaciones', error: err.message });
        }
    }

    static async getByID(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const location = await Location.get({ id: parseInt(id) });
            res.json(location);

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener la ubicación', error: err.message });
        }  
    }

    static async create(req: Request, res: Response) {
       try {
            const location = await Location.create(req.body);
            res.status(201).json({ message: 'Ubicación creada exitosamente', data: location });

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al crear la ubicación', error: err.message });
        } 
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const actualizada = await Location.update(parseInt(id), req.body);
            res.json({ message: 'Ubicación actualizada exitosamente', data: actualizada });

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al actualizar la ubicación', error: err.message });
        }
    }
    
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const eliminada = await Location.delete(parseInt(id));
            res.json({ message: 'Ubicación eliminada exitosamente', data: eliminada });
            
        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Error al eliminar la ubicación', error: err.message });
        }
    }

    static async getComponents(req: Request, res: Response) {
        try {
            const { location_id } = req.params;
            const components = await Location.getComponents(location_id);
            res.json(components);

        } catch (err: any) {
            if (err instanceof ValidationError) res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Error al obtener componentes en ubicación', error: err.message });
        }
    }
}
export default LocationController;