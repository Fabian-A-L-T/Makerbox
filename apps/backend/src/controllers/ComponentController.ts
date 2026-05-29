import { type Request, type Response } from "express";
import Component from "../models/Component.js";
import { ValidationError, NotFoundError } from "../errors.js";
import {type ComponentQueryData } from "../models/Component.js";

class ComponentController {

    static async getAll(req: Request, res: Response) {
        try {
            const { search, limit, offset, orderBy, desc, category, manufacturer } = req.query as ComponentQueryData;
            const components = await Component.get({search, limit, offset, orderBy, desc, category, manufacturer});
            res.json(components);

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else res.status(500).json({ message: 'Error al obtener los componentes', error: err.message });
        }
    }

    static async getByID(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const component = await Component.get({id: parseInt(id)});
            res.json(component);

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Componente no encontrado', error: err.message });
            else res.status(500).json({ message: 'Error al obtener el componente', error: err.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const newComponent = await Component.create(req.body);
            res.status(201).json({ message: "Componente creado exitosamente", data: newComponent });

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else res.status(500).json({ message: 'Error al crear el componente', error: err.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updatedComponent = await Component.update(parseInt(id), req.body);
            res.json({ message: "Componente actualizado exitosamente", data: updatedComponent });

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Componente no encontrado', error: err.message });
            else res.status(500).json({ message: 'Error al actualizar el componente', error: err.message });
        }
    }

    static async restore(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const component = await Component.restore(parseInt(id));
            res.json({ message: "Componente restaurado exitosamente", data: component });

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Componente no encontrado', error: err.message });
            else res.status(500).json({ message: 'Error al restaurar el componente', error: err.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const component = await Component.delete(parseInt(id));
            res.json({ message: "Componente eliminado exitosamente", data: component });

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Componente no encontrado', error: err.message });
            else res.status(500).json({ message: 'Error al eliminar el componente', error: err.message });
        }
    }

    static async getLocations(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const rows = await Component.getLocations(parseInt(id));
            res.json(rows);

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Componente no encontrado', error: err.message });
            else res.status(500).json({ message: 'Error al obtener stock por ubicación', error: err.message });
        }
    }
    
    static async addToLocation(req: Request, res: Response) {
        try {
            const { component_id } = req.params;
            const { location_id, amount } = req.body;
            const nuevo = await Component.addToLocation(parseInt(component_id), parseInt(location_id), parseInt(amount));
            res.status(201).json({ message: 'Asignación creada exitosamente', data: nuevo });

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Componente no encontrado', error: err.message });
            else res.status(500).json({ message: 'Error al crear la asignación', error: err.message });
        }
    }

    static async updateQuantity(req: Request, res: Response) {
        try {
            const { component_id, location_id } = req.params;
            const { quantity } = req.body;
            const actualizado = await Component.updateQuantity(parseInt(component_id), parseInt(location_id), parseInt(quantity));
            res.json({ message: 'Cantidad actualizada exitosamente', data: actualizado });

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Componente no encontrado', error: err.message });
            else res.status(500).json({ message: 'Error al actualizar la cantidad', error: err.message });
        }
    }

    static async removeFromLocation(req: Request, res: Response) {
        try {
            const { component_id, location_id } = req.params;
            const eliminado = await Component.removeFromLocation(parseInt(component_id), parseInt(location_id));
            res.json({ message: 'Asignación eliminada exitosamente', data: eliminado });

        } catch (err: any) {
            if(err instanceof ValidationError) res.status(400).json({ message: 'Error de validacion', error: err.message });
            else if(err instanceof NotFoundError) res.status(404).json({ message: 'Componente no encontrado', error: err.message });
            else res.status(500).json({ message: 'Error al eliminar la asignación', error: err.message });
        }
    }
}
export default ComponentController;
