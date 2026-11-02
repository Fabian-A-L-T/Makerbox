import sql from "../config/database.js";
import type { RefreshTokenData } from "../utils/schemas.js";

export default class RefreshToken {
    static async create(data: RefreshTokenData) {
        return await sql`
            INSERT INTO refresh_tokens ${sql(data)} 
            RETURNING *`;
    }
    static async findByToken(tokenHash: string) {
        return await sql`
            SELECT * FROM refresh_tokens 
            WHERE token_hash = ${tokenHash}`;
    }
    static async deleteByToken(tokenHash: string) {
        return await sql`
            DELETE FROM refresh_tokens 
            WHERE token_hash = ${tokenHash} 
            RETURNING *`;
    }
}