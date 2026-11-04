import sql from "../config/database";

(globalThis as typeof globalThis & { closeTestDatabase: () => Promise<void> })
  .closeTestDatabase = () => sql.end();