import { type Request, type Response } from "express";
import User from "../models/User.js";
import { ValidationError, NotFoundError } from "../errors.js";
import { UserPassword } from '../models/schemas.js';
import bcrypt from "bcrypt";
import { safeParse } from "valibot";

class UserController {

    static async getAll(_req: Request, res: Response){
        try {
            const users = await User.get();
            res.json(users);

        } catch (err: any) {
            res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }

    static async getByID(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const user = await User.get(parseInt(id));
            res.json(user);
        } catch (err: any) {
            if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) return res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }

    static async create(req: Request, res: Response) {
        const {name, email, role, passwd} = req.body;

        const validatedPasswd = safeParse(UserPassword, passwd);
        if(!validatedPasswd.success) throw new ValidationError();

        const hashPasswd = await bcrypt.hash(validatedPasswd.output, 10);
        try {
            const user = await User.create({name, email, role, passwd: hashPasswd});
            res.status(201).json({ message: "Usuario creado exitosamente", data: user });
        } catch (err: any) {
            if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updatedUser = await User.update(parseInt(id), req.body);
            res.json({ message: 'Usuario actualizado exitosamente', data: updatedUser });

        } catch (err: any) {
            if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }

    static async restore(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const restoredUser = await User.restore(parseInt(id));

            res.json({ message: 'Usuario restaurado exitosamente', data: restoredUser });

        } catch (err: any) {
            if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) return res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const deletedUser = await User.delete(parseInt(id));

            res.json({ message: 'Usuario eliminado exitosamente', data: deletedUser });

        } catch (err: any) {
            if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) return res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }
}
export default UserController;
