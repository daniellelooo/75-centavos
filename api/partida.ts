// La partida en la nube: leerla y guardarla. Una por jugador y juego.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { JUEGOS, ensurePerfil, json, sql, userIdOf } from "./_lib.js";

const MAX_BYTES = 256 * 1024;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await userIdOf(req);
  if (!userId) return json(res, 401, { error: "sin sesión" });

  if (req.method === "GET") {
    const juego = String(req.query.juego ?? "");
    if (!JUEGOS.includes(juego)) return json(res, 400, { error: "juego desconocido" });
    const rows = await sql`select datos, actualizado from partidas where user_id = ${userId} and juego = ${juego}`;
    return json(res, 200, rows[0] ?? null);
  }

  if (req.method !== "PUT") return json(res, 405, { error: "método no permitido" });
  const b = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) ?? {};
  const juego = String(b.juego ?? "");
  if (!JUEGOS.includes(juego)) return json(res, 400, { error: "juego desconocido" });
  const datos = JSON.stringify(b.datos ?? null);
  if (!b.datos || typeof b.datos !== "object" || datos.length > MAX_BYTES) return json(res, 400, { error: "partida no válida" });
  const misiones = Math.max(0, Math.min(1000, Number(b.misiones) || 0));
  const terminado = !!b.terminado;
  const rango = String(b.rango ?? "").slice(0, 60);
  const tiempo = Math.max(0, Math.min(1e10, Number(b.tiempo_ms) || 0));

  await ensurePerfil(userId);
  await sql`
    insert into partidas (user_id, juego, datos, misiones, terminado, rango, tiempo_ms, actualizado)
    values (${userId}, ${juego}, ${datos}::jsonb, ${misiones}, ${terminado}, ${rango}, ${tiempo}, now())
    on conflict (user_id, juego) do update set
      datos = excluded.datos, misiones = excluded.misiones, terminado = excluded.terminado,
      rango = excluded.rango, tiempo_ms = excluded.tiempo_ms, actualizado = now()`;
  return json(res, 200, { ok: true });
}
