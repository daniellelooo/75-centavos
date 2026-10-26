// ¿Quedan cuentas nuevas? Cuenta los usuarios en Clerk y lo compara con el límite
// de la instancia de desarrollo. No expone el número, solo si está lleno.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clerk } from "./_lib.js";
import { cupoLleno } from "../src/shared/cupo.js";

// Se recuerda un minuto por instancia para no consultar Clerk en cada clic.
let cache: { lleno: boolean; hasta: number } | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "método no permitido" });
    return;
  }
  try {
    if (!cache || cache.hasta < Date.now()) {
      const total = await clerk.users.getCount();
      cache = { lleno: cupoLleno(total), hasta: Date.now() + 60_000 };
    }
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=60");
    res.status(200).json({ lleno: cache.lleno });
  } catch {
    // Si Clerk no responde, no se bloquea a nadie: que intente entrar.
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ lleno: false });
  }
}
