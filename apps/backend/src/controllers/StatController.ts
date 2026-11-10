import { number, safeParse } from "valibot";
import Stats from "../models/Stats.js";
import { type Request, type Response } from "express";
import { ValidationError } from "../utils/errors.js";

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

    static async getGlobalProjectStats(_req: Request, res: Response) {
        try {
            const stats = await Stats.getGlobalProjectStats();
            res.json({content: stats});
        }
        catch (err: any) {
            res.status(500).json({ message: 'Error al obtener los datos', error: err.message });
        }
    }

    static async getUserProjectStats(req: Request, res: Response) {
        try {
            const user_id: number = req.body.user.id;

            const validatedUserId = safeParse(number(), user_id);
            if (!validatedUserId.success) throw new ValidationError();

            const stats = await Stats.getUserProjectStats(validatedUserId.output);
            res.json({content: stats});
        }
        catch (err: any) {
            res.status(500).json({ message: 'Error al obtener los datos', error: err.message });
        }
    }

    static async refreshStats(_req: Request, res: Response) {
        try {
            await Stats.refreshStats();
            res.json({message: 'ok'});
        }
        catch (err: any) {
            res.status(500).json({ message: 'Error al actualizar estadísticas', error: err.message });
        }
    }
}