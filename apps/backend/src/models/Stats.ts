import sql from "../config/database.js";

export default class Stats {
    static async getComponentStats(){
        return await sql`SELECT * FROM mv_component_category_stats`;
    }

    static async getToolStats(){
        return await sql`SELECT * FROM mv_tool_category_stats`;
    }

    static async getProjectStats(){
        return await sql`SELECT * FROM mv_project_state_stats`;
    }

    static async refreshStats(){
        return Promise.all([
            await sql`REFRESH MATERIALIZED VIEW mv_component_category_stats`,
            await sql`REFRESH MATERIALIZED VIEW mv_tool_category_stats`,
            await sql`REFRESH MATERIALIZED VIEW mv_project_state_stats`,
        ]);
    }
}