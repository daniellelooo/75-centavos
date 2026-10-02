// Crea las tablas de Eternal Games en Neon. Se puede ejecutar varias veces.
// Uso: node --env-file=.env.local scripts/db-init.mjs
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// perfiles: uno por cuenta. user_id es el id de Clerk (nunca llega del navegador sin verificar).
await sql`
  create table if not exists perfiles (
    user_id   text primary key,
    alias     text unique not null check (alias ~ '^[a-z0-9-]{3,24}$'),
    nombre    text not null default '',
    publico   boolean not null default true,
    creado    timestamptz not null default now()
  )`;

// partidas: una por jugador y juego. datos es la partida tal cual (JSON del juego).
await sql`
  create table if not exists partidas (
    user_id     text not null references perfiles(user_id) on delete cascade,
    juego       text not null,
    datos       jsonb not null,
    misiones    int not null default 0,
    terminado   boolean not null default false,
    rango       text not null default '',
    tiempo_ms   bigint not null default 0,
    actualizado timestamptz not null default now(),
    primary key (user_id, juego)
  )`;

const tablas = await sql`select table_name from information_schema.tables where table_schema = 'public' order by 1`;
console.log("tablas:", tablas.map((t) => t.table_name).join(", "));
