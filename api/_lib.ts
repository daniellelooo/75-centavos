// Utilidades del servidor: verificar la sesión de Clerk y hablar con Neon.
// El user_id SIEMPRE sale del token verificado, nunca de lo que mande el navegador.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

/** Juegos que existen: no se guarda nada con otro nombre. */
export const JUEGOS = ["75-centavos", "retos", "diez-dias", "la-consulta", "codigo-cuervo", "medianoche"];

export async function userIdOf(req: VercelRequest): Promise<string | null> {
  const h = req.headers.authorization ?? "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return null;
  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

/** Crea el perfil la primera vez, con un alias a partir del nombre de la cuenta. */
export async function ensurePerfil(userId: string) {
  const rows = await sql`select alias, nombre, publico from perfiles where user_id = ${userId}`;
  if (rows.length) return rows[0];
  const u = await clerk.users.getUser(userId);
  const nombre = (u.firstName || u.username || u.emailAddresses[0]?.emailAddress.split("@")[0] || "jugador").slice(0, 40);
  const base = slug(nombre) || "jugador";
  for (let i = 0; i < 5; i++) {
    const alias = `${base.slice(0, 18)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const ins = await sql`
      insert into perfiles (user_id, alias, nombre) values (${userId}, ${alias}, ${nombre})
      on conflict do nothing returning alias, nombre, publico`;
    if (ins.length) return ins[0];
    const again = await sql`select alias, nombre, publico from perfiles where user_id = ${userId}`;
    if (again.length) return again[0];
  }
  throw new Error("no se pudo crear el perfil");
}

export function slug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function json(res: VercelResponse, status: number, body: unknown) {
  res.setHeader("Cache-Control", "no-store");
  res.status(status).json(body);
}
