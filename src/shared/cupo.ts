// Cupo de cuentas nuevas. Clerk sigue en su instancia de desarrollo, que admite
// como máximo 100 usuarios: al llegar ahí, nadie más puede crear cuenta (los que
// ya tienen siguen entrando). Mientras tanto se juega sin sesión y el progreso
// queda en el navegador.

export const LIMITE_CUENTAS = 100;

/** El cupo está lleno cuando ya hay tantas cuentas como admite Clerk. */
export const cupoLleno = (total: number, limite = LIMITE_CUENTAS): boolean => total >= limite;

export const AVISO_CUPO = {
  titulo: "Llegamos al límite de cuentas",
  texto:
    "En este momento no se pueden crear cuentas nuevas. Puedes jugar sin sesión: tu partida se guarda en este navegador. Si ya tienes cuenta, entra normalmente.",
  entrar: "Ya tengo cuenta",
  seguir: "Jugar sin cuenta",
};
