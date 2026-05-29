import sql from "../config/database.js";
import { safeParse, number } from "valibot";
import { ManufacturerCreate, type ManufacturerCreateData } from "../models/schemas.js";
import { ValidationError, NotFoundError } from "../errors.js";

class Manufacturer {
    
    static async get(id?: number){
        if (id) {
            const validatedId = safeParse(number(), id);
            if (!validatedId.success) throw new ValidationError();

            const row = await sql`
                SELECT * FROM manufacturers 
                WHERE id = ${validatedId.output}`;
            if (!row.length) throw new NotFoundError();
            return row[0];
        }
        return await sql`
            SELECT * FROM manufacturers
            ORDER BY id`;
    }

    static async create(data: ManufacturerCreateData){
        const validatedData = safeParse(ManufacturerCreate, data);
        if (!validatedData.success) throw new ValidationError();

        const rows = await sql`
            INSERT INTO manufacturers ${sql(validatedData.output)} 
            RETURNING *`;

        return rows[0];
    }

    static async update(id: number, data: ManufacturerCreateData){
        const validatedId = safeParse(number(), id);
        if (!validatedId.success) throw new ValidationError();

        const validatedData = safeParse(ManufacturerCreate, data);
        if (!validatedData.success) throw new ValidationError();

        const rows = await sql`
            UPDATE manufacturers SET ${sql(validatedData.output)}, updated_at = now() 
            WHERE id = ${validatedId.output}
            RETURNING *`;

        if (!rows.length) throw new NotFoundError();
        return rows[0];
    }

    static async delete(id: number){
        const validatedId = safeParse(number(), id);
        if (!validatedId.success) throw new ValidationError();

        const rows = await sql`
            DELETE FROM manufacturers  
            WHERE id = ${validatedId.output}
            RETURNING *`;
        
        if (!rows.length) throw new NotFoundError();
        return rows[0];
    }
}

export default Manufacturer;