// Mi perfil: leerlo (se crea solo la primera vez) y cambiar alias, nombre o si es público.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensurePerfil, json, sql, userIdOf } from "./_lib.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await userIdOf(req);
  if (!userId) return json(res, 401, { error: "sin sesión" });
  const perfil = await ensurePerfil(userId);
  if (req.method === "GET") {
    // el dueño ve su progreso aunque el perfil sea privado
    const extra = await sql`select creado from perfiles where user_id = ${userId}`;
    const juegos = await sql`select juego, misiones, terminado, rango, tiempo_ms from partidas where user_id = ${userId} order by juego`;
    return json(res, 200, { ...perfil, desde: extra[0]?.creado, juegos });
  }
  if (req.method !== "PUT") return json(res, 405, { error: "método no permitido" });

  const b = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) ?? {};
  const alias = typeof b.alias === "string" ? b.alias.trim().toLowerCase() : perfil.alias;
  const nombre = typeof b.nombre === "string" ? b.nombre.trim().slice(0, 40) : perfil.nombre;
  const publico = typeof b.publico === "boolean" ? b.publico : perfil.publico;
  if (!/^[a-z0-9-]{3,24}$/.test(alias)) return json(res, 400, { error: "El alias va en minúsculas, con números o guiones, de 3 a 24 caracteres." });
  try {
    const rows = await sql`
      update perfiles set alias = ${alias}, nombre = ${nombre}, publico = ${publico}
      where user_id = ${userId} returning alias, nombre, publico`;
    return json(res, 200, rows[0]);
  } catch (e) {
    if (String(e).includes("duplicate")) return json(res, 409, { error: "Ese alias ya lo usa otra persona." });
    throw e;
  }
}
