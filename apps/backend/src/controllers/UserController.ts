import { type Request, type Response } from "express";
import User from "../models/User.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import { filterSchema, paginationSchema, userRegisterSchema, userSchema } from '../utils/schemas.js';
import bcrypt from "bcrypt";
import { number, safeParse } from "valibot";
import { generatePagination } from "../utils/utils.js";

export default class UserController {
    static async getAll(req: Request, res: Response){
        try {
            const { search, limit, offset, orderBy, desc } = req.query;
            
            const validatedPagination = safeParse(paginationSchema, {limit, offset});
            if(!validatedPagination.success) throw new ValidationError();

            const validatedFilters = safeParse(filterSchema, { search, orderBy, desc});
            if (!validatedFilters.success) throw new ValidationError();

            const users = await User.get({...validatedPagination.output, ...validatedFilters.output});
            res.json(await generatePagination({
                content: users,
                tableName: 'users',
                hasSoftDelete: true,
                resourceRoute: 'users',
                ...(validatedPagination.output),
                otherParams: validatedFilters.output
            }));
        }
        catch (err: any) {
            res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }

    static async getByID(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();

            const user = await User.getById(validatedId.output);
            res.json({content: user});
        }
        catch (err: any) {
            if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) return res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const {name, email, role, passwd} = req.body;
            
            const validatedData = safeParse(userSchema, {name, email, role, passwd});
            if(!validatedData.success) throw new ValidationError();

            validatedData.output.passwd = await bcrypt.hash(validatedData.output.passwd, 10);

            const user = await User.create(validatedData.output);
            res.status(201).json({ message: "Usuario creado exitosamente", data: user });
        }
        catch (err: any) {
            if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.body;
            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();
            
            const validatedData = safeParse(userSchema, req.body);
            if(!validatedData.success) throw new ValidationError();

            const updatedUser = await User.update(validatedId.output, validatedData.output);
            res.json({ message: 'Usuario actualizado exitosamente', data: updatedUser });
        }
        catch (err: any) {
            if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }

    static async updateProfile(req: Request, res: Response) {
        try {
            const { id } = req.body.user;
            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();

            const validatedData = safeParse(userRegisterSchema, req.body);
            if(!validatedData.success) throw new ValidationError();

            validatedData.output.passwd = await bcrypt.hash(validatedData.output.passwd, 10);

            const updatedUser = await User.update(validatedId.output, validatedData.output);
            res.json({ message: 'Usuario actualizado exitosamente', data: updatedUser });
        }
        catch (err: any) {
            if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
            else res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }

    static async restore(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();

            const restoredUser = await User.restore(validatedId.output);
            res.json({ message: 'Usuario restaurado exitosamente', data: restoredUser });
        }
        catch (err: any) {
            if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) return res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();

            const deletedUser = await User.delete(validatedId.output);
            res.json({ message: 'Usuario eliminado exitosamente', data: deletedUser });
        }
        catch (err: any) {
            if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
            else if (err instanceof NotFoundError) return res.status(404).json({ message: err.message });
            else res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }
}
