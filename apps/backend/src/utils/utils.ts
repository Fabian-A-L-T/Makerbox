import sql from "../config/database";
import crypto from 'crypto';
import RefreshToken from "../models/RefreshToken";
import type { Response } from "express";
import { longRefreshTTL, shortRefreshTTL } from "../config/app";

interface GeneratePaginationData<T> {
    content: Array<T>, 
    tableName: string,
    hasSoftDelete: boolean,
    resourceRoute: string, 
    limit: number, 
    offset: number, 
    otherParams?: Record<string, string | undefined>
}
export async function generatePagination<T>({content, tableName, hasSoftDelete, resourceRoute, limit, offset, otherParams}: GeneratePaginationData<T>){

    const apiURL = `/${resourceRoute}`;
    const params = new URLSearchParams({
        limit: limit.toString(),
        ...Object.fromEntries(Object.entries(otherParams ?? {}).filter(([_, v]) => v !== undefined))
    });
    const start = `${apiURL}?offset=0&${params}`;
    const prev = offset > 0 && `${apiURL}?offset=${offset - limit}&${params}`;
    let next;

    if(content.length === limit){
        const limitPlusOneQuery = await sql`SELECT id FROM ${sql(tableName)} ${hasSoftDelete ? sql`WHERE deleted_at IS NULL` : sql``} LIMIT 1 OFFSET ${offset + limit}`;
        if (limitPlusOneQuery.length !== 0) {
            next = `${apiURL}?offset=${offset + limit}&${params}`;
        }
    }
    
    return {
        content,
        pagination: {
            limit,
            offset,
        },
        links: {
            start,
            ...(prev && {prev}),
            ...(next && {next}),
        }
    };
}

export async function generateRefreshToken(userId: number, remember: boolean, res: Response<any, Record<string, any>>, ip: string, userAgent: string){
    
    const refresh_token = crypto.randomBytes(48).toString('hex');
    const refresh_token_ttl = remember ? longRefreshTTL : shortRefreshTTL;
    const tokenHash = crypto.createHash('sha256').update(refresh_token).digest('hex');

    await RefreshToken.create({
        token_hash: tokenHash,
        user_id: userId,
        remember: remember,
        user_agent: userAgent,
        ip_address: ip,
        expires_at: new Date(Date.now() + refresh_token_ttl),

    });
    res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/api/auth',
        ...(remember ? { maxAge: refresh_token_ttl } : {}),
    });
}