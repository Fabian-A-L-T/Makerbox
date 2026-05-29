import postgres from 'postgres'
import { loadEnvFile } from 'node:process';

loadEnvFile('.env');

const sql = postgres({
    host: process.env.DB_HOST,
    db: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    //debug: (connection, query, params, types) => {
    //    console.log('Connection:', connection);
    //    console.log('Query:', query);
    //    console.log('Parameters:', params);
    //}
}) as postgres.Sql;

export default sql;