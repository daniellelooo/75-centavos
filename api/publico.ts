// Perfil público: solo alias, nombre y progreso por juego. Nada de correos ni ids.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { json, sql } from "./_lib";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return json(res, 405, { error: "método no permitido" });
  const alias = String(req.query.alias ?? "").toLowerCase();
  if (!/^[a-z0-9-]{3,24}$/.test(alias)) return json(res, 404, { error: "no existe" });
  const p = await sql`select user_id, alias, nombre, creado from perfiles where alias = ${alias} and publico`;
  if (!p.length) return json(res, 404, { error: "no existe" });
  const juegos = await sql`
    select juego, misiones, terminado, rango, tiempo_ms from partidas where user_id = ${p[0].user_id} order by juego`;
  return json(res, 200, { alias: p[0].alias, nombre: p[0].nombre, desde: p[0].creado, juegos });
}
