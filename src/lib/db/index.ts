import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  "postgresql://postgres:postgres@localhost:5432/cargamaster";

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

const isDev = process.env.NODE_ENV === "development";

const client =
  globalForDb.client ??
  postgres(connectionString, {
    max: isDev ? 5 : 1,
    idle_timeout: 10,
    max_lifetime: 60 * 2,
    connect_timeout: 15,
    prepare: false, // Requerido para Supabase Transaction Pooler (puerto 6543)
  });

if (isDev) {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
export type Db = typeof db;
