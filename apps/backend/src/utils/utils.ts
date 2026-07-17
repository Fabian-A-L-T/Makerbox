import sql from "../config/database.js";

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
