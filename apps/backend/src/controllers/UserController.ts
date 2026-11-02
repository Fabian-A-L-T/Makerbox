import { type Request, type Response } from "express";
import User from "../models/User.js";
import { ValidationError, HttpError, PasswordError } from "../utils/errors.js";
import { filterSchema, paginationSchema, userLoginSchema, userSchema, userUpdateSchema, userUpdatePasswdSchema, userRoleSchema } from '../utils/schemas.js';
import bcrypt from "bcrypt";
import { number, safeParse } from "valibot";
import { generatePagination } from "../utils/utils.js";
import sql from "../config/database.js";

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
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async getByID(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();

            const user = await User.getById(validatedId.output);
            res.json({content: user[0]});
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const {name, email, role, passwd} = req.body;
            
            const validatedData = safeParse(userSchema, {name, email, role, passwd});
            if(!validatedData.success) throw new ValidationError();

            validatedData.output.passwd = await bcrypt.hash(validatedData.output.passwd, 10);

            const user = await User.create(validatedData.output);
            res.status(201).json({ message: "Usuario creado exitosamente", data: user[0] });
        }
        catch (error: any) {
            const status = error instanceof HttpError 
                ? error.statusCode 
                : error instanceof sql.PostgresError && error.code === '23505' 
                    ? 409
                    : 500;
            res.status(status).json({ message: status === 409 ? 'Este correo ya existe' : error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();
            
            const validatedData = safeParse(userRoleSchema, req.body);
            if(!validatedData.success) throw new ValidationError();

            const updatedUser = await User.updateRole(validatedId.output, validatedData.output.role);
            res.json({ message: 'Usuario actualizado exitosamente', data: updatedUser[0] });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async updateName(req: Request, res: Response) {
        try {
            const { id } = req.body.user;
            const { success: idSuccess, output: userId } = safeParse(number(), parseInt(id));
            if(!idSuccess) throw new ValidationError();

            const { success: dataSuccess, output: data } = safeParse(userUpdateSchema.entries['name'], req.body.name);
            if(!dataSuccess) throw new ValidationError();

            const updatedUser = await User.updateName(userId, data);
            res.json({ message: 'Usuario actualizado exitosamente', data: updatedUser[0] });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async updateEmail(req: Request, res: Response) {
        try {
            const { id } = req.body.user;

            const { success: idSuccess, output: userId } = safeParse(number(), parseInt(id));
            if(!idSuccess) throw new ValidationError();

            const { success: dataSuccess, output: data } = safeParse(userLoginSchema, req.body);
            if(!dataSuccess) throw new ValidationError();
            
            const validPasswd = await User.hasEqualPasswd(userId, data.passwd);
            if(!validPasswd) throw new PasswordError();

            const updatedUser = await User.updateEmail(userId, data.email);
            res.json({ message: 'Usuario actualizado exitosamente', data: updatedUser[0] });
        }
        catch (error: any) {
            const status = error instanceof HttpError 
                ? error.statusCode 
                : error instanceof sql.PostgresError && error.code === '23505' 
                    ? 409
                    : 500;
            res.status(status).json({ message: status === 409 ? 'Este correo se encuentra en uso' : error.message });
        }
    }

    static async updatePassword(req: Request, res: Response) {
        try {
            const { id } = req.body.user;

            const { success: idSuccess, output: userId } = safeParse(number(), parseInt(id));
            if(!idSuccess) throw new ValidationError();
            
            const { success: dataSuccess, output: data } = safeParse(userUpdatePasswdSchema, req.body);
            if(!dataSuccess) throw new ValidationError();
            
            const validPasswd = await User.hasEqualPasswd(userId, data.passwd);
            if(!validPasswd) throw new PasswordError();

            const hashedPasswd = bcrypt.hashSync(data.new_passwd, 10);

            const updatedUser = await User.updatePasswd(userId, hashedPasswd);
            res.json({ message: 'Usuario actualizado exitosamente', data: updatedUser[0] });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async restore(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();

            const restoredUser = await User.restore(validatedId.output);
            res.json({ message: 'Usuario restaurado exitosamente', data: restoredUser[0] });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const validatedId = safeParse(number(), parseInt(id));
            if(!validatedId.success) throw new ValidationError();

            const deletedUser = await User.delete(validatedId.output);
            res.json({ message: 'Usuario eliminado exitosamente', data: deletedUser[0] });
        }
        catch (error: any) {
            const status = error instanceof HttpError ? error.statusCode : 500;
            res.status(status).json({ message: error.message });
        }
    }
}
