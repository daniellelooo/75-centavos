// Landing: el botón de cuenta de la barra. Sin sesión, "Entrar"; con sesión,
// el avatar de Clerk y el enlace a tu perfil.
import { entrar, getClerk, hasAccounts } from "../shared/auth";

const slot = document.querySelector<HTMLElement>("#cuenta");

async function paint(): Promise<void> {
  if (!slot || !hasAccounts()) return;
  const clerk = await getClerk();
  if (!clerk) return;
  if (clerk.isSignedIn) {
    slot.innerHTML = `<a class="me" href="/perfil/">Mi perfil</a><span id="avatar"></span>`;
    clerk.mountUserButton(slot.querySelector("#avatar") as HTMLDivElement, { afterSignOutUrl: "/" } as never);
  } else {
    slot.innerHTML = `<button class="enter" type="button">Entrar</button>`;
    (slot.querySelector(".enter") as HTMLButtonElement).onclick = () => void entrar({ forceRedirectUrl: "/perfil/" });
  }
}

void (async () => {
  await paint();
  const clerk = await getClerk();
  let was = clerk?.isSignedIn;
  clerk?.addListener(() => {
    if (clerk.isSignedIn !== was) {
      was = clerk.isSignedIn;
      void paint();
    }
  });
})();
