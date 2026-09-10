import path from "node:path";
import { getDatabase } from "../src/server/db/database";

const databasePath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "inheritance.db");
const database = getDatabase();
database.close();

console.log(`SQLite database initialized at ${databasePath}`);
