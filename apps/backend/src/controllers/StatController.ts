import Stats from "../models/Stats.js";
import { type Request, type Response } from "express";

export default class StatController {
    static async getComponentStats(_req: Request, res: Response) {
        try {
            const stats = await Stats.getComponentStats();
            res.json({content: stats});
        }
        catch (err: any) {
            res.status(500).json({ message: 'Error al obtener los datos', error: err.message });
        }
    }

    static async getToolStats(_req: Request, res: Response) {
        try {
            const stats = await Stats.getToolStats();
            res.json({content: stats});
        }
        catch (err: any) {
            res.status(500).json({ message: 'Error al obtener los datos', error: err.message });
        }
    }

    static async getProjectStats(_req: Request, res: Response) {
        try {
            const stats = await Stats.getProjectStats();
            res.json({content: stats});
        }
        catch (err: any) {
            res.status(500).json({ message: 'Error al obtener los datos', error: err.message });
        }
    }
}