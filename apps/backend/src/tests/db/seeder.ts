import sql from "../../config/database";
import bcrypt from "bcrypt";
import type { ComponentLocationData, ProjectComponentData, ProjectToolData, UserData } from "../../utils/schemas";

export interface UserDataTest extends UserData {
    id: number;
    role: "admin" | "technician" | "reader";
    deleted_at?: string | null;
}

export interface TestData {
    id: number;
    deleted_at?: string | null;
}

export async function seedData<T extends {id: number}>(table: string, resources: {[x: string]: T }){
    return Promise.all(Object.entries(resources).map(async ([key, values]) => {
        let {id, ...data} = values;
        const [insertedData] = await sql`INSERT INTO ${sql(table)} ${sql(data as Record<string, any>)} RETURNING id`;
        resources[key].id = insertedData.id;
    }));
}

export async function seedComponentLocations(data: {[x: string]: ComponentLocationData }){
    return Promise.all(Object.entries(data).map(async ([_, values]) => {
        await sql`INSERT INTO component_location ${sql(values)}`;
    }));
}

export async function seedProjectComponents(data: {[x: string]: ProjectComponentData }){
    return Promise.all(Object.entries(data).map(async ([_, values]) => {
        await sql`INSERT INTO project_component ${sql(values)}`;
    }));
}

export async function seedProjectTools(data: {[x: string]: ProjectToolData }){
    return Promise.all(Object.entries(data).map(async ([_, values]) => {
        await sql`INSERT INTO project_tool ${sql(values)}`;
    }));
}

export async function updateStatViews(){
    return Promise.all([
        await sql`REFRESH MATERIALIZED VIEW mv_component_category_stats`,
        await sql`REFRESH MATERIALIZED VIEW mv_tool_category_stats`,
        await sql`REFRESH MATERIALIZED VIEW mv_project_state_stats`,
    ])
}

export async function seedUsers(users: {[x: string]: UserDataTest}){
    return Promise.all(Object.entries(users).map(async ([email, values]) => {
        let {id, ...data} = values;
        data.passwd = bcrypt.hashSync(values.passwd, 10);
        const [userData] = await sql`INSERT INTO users ${sql(data)} RETURNING id`;
        users[email].id = userData.id;
    }));
}

export async function clearManufacturers(){
    return await sql`TRUNCATE manufacturers RESTART IDENTITY CASCADE`;
}
export async function clearLocations(){
    return await sql`TRUNCATE locations RESTART IDENTITY CASCADE`;
}
export async function clearToolCategories(){
    return await sql`TRUNCATE tool_categories RESTART IDENTITY CASCADE`;
}
export async function clearCategories(){
    return await sql`TRUNCATE component_categories RESTART IDENTITY CASCADE`;
}
export async function clearTools(){
    return await sql`TRUNCATE tools RESTART IDENTITY CASCADE`;
}
export async function clearComponents(){
    return await sql`TRUNCATE components RESTART IDENTITY CASCADE`;
}
export async function clearProjects(){
    return await sql`TRUNCATE projects RESTART IDENTITY CASCADE`;
}
export async function clearStockMovements(){
    return await sql`TRUNCATE stock_movements RESTART IDENTITY CASCADE`;
}
export async function clearUsers(){
    return await sql`TRUNCATE users RESTART IDENTITY CASCADE`;
}