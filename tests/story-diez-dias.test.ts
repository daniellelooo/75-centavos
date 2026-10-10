// Errores típicos de Diez días: cada uno debe recibir un mensaje que diga qué falta.
import { describe, expect, it } from "vitest";
import { grade } from "../src/game/run-local";
import { CONTENT } from "../src/stories/diez-dias/content";

const m = (id: string) => CONTENT.missions.find((x) => x.id === id)!;
const falla = async (id: string, code: string, msg: RegExp) => {
  const r = await grade(m(id), code);
  expect(r.pass, r.feedback).toBe(false);
  expect(r.feedback).toMatch(msg);
};

describe("diez-dias: errores típicos", () => {
  it("dd1: cambia el titular pero no muestra el texto viejo", () =>
    falla("dd1", 'let titular = document.querySelector("#titular");\ntitular.textContent = "Bienvenido a Nébula";', /console\.log/));

  it("dd1: muestra el titular después de cambiarlo", () =>
    falla(
      "dd1",
      'let titular = document.querySelector("#titular");\ntitular.textContent = "Bienvenido a Nébula";\nconsole.log(titular.textContent);',
      /antes/,
    ));

  it("dd1: titular sin tilde", () =>
    falla("dd1", 'let t = document.querySelector("#titular");\nconsole.log(t.textContent);\nt.textContent = "Bienvenido a Nebula";', /tilde/));

  it("dd2: className pisa la clase que ya tenía", () =>
    falla("dd2", 'let o = document.querySelector("#oferta");\no.className = "parpadeo";\no.style.color = "red";', /classList\.add/));

  it("dd3: ruta escrita a mano falla en la otra página", () =>
    falla(
      "dd3",
      'let logo = document.querySelector("#logo");\nlogo.setAttribute("src", "imagenes/logo.gif");\nlogo.setAttribute("alt", "Logo de Nébula");',
      /a mano/,
    ));

  it("dd3: olvida la barra de la carpeta", () =>
    falla(
      "dd3",
      'let logo = document.querySelector("#logo");\nlogo.setAttribute("src", "imagenes" + logo.getAttribute("src"));\nlogo.setAttribute("alt", "Logo de Nébula");',
      /barra/,
    ));

  it("dd4: querySelector cambia solo el primero", () =>
    falla("dd4", 'let p = document.querySelector(".precio");\np.textContent = "GRATIS";\nconsole.log(1);', /querySelectorAll/));

  it("dd4: número de precios escrito a mano", () =>
    falla(
      "dd4",
      'let precios = document.querySelectorAll(".precio");\nprecios.forEach((p) => { p.textContent = "GRATIS"; });\nconsole.log(3);',
      /precios\.length/,
    ));

  it("dd5: suma texto en vez de número", () =>
    falla(
      "dd5",
      'let c = document.querySelector("#contador");\ndocument.querySelector("#visitar").addEventListener("click", () => {\n  c.textContent = c.textContent + 1;\n});',
      /Number/,
    ));

  it("dd5: cambia el contador sin esperar al clic", () =>
    falla("dd5", 'let c = document.querySelector("#contador");\nc.textContent = Number(c.textContent) + 1;', /addEventListener/));

  it("dd6: remove en vez de toggle", () =>
    falla(
      "dd6",
      'let b = document.querySelector("#ver-mas");\nlet d = document.querySelector("#detalles");\nb.addEventListener("click", () => { d.classList.remove("oculto"); b.textContent = "Ver menos"; });',
      /segundo clic/,
    ));

  it("dd7: lee el valor fuera del evento", () =>
    falla(
      "dd7",
      'let firma = document.querySelector("#firma");\nlet nombre = firma.value;\nfirma.addEventListener("input", () => {\n  document.querySelector("#vista").textContent = "Firmado por: " + nombre;\n});',
      /dentro de la función/,
    ));

  it("dd8: falta el Escape", () =>
    falla(
      "dd8",
      'document.addEventListener("keydown", (e) => {\n  if (e.key === "h") document.querySelector("#ayuda").classList.toggle("oculto");\n});',
      /Escape/,
    ));

  it("dd9: innerHTML borra las novedades que ya estaban", () =>
    falla(
      "dd9",
      'function agregar(texto) {\n  document.querySelector("#novedades").innerHTML = "<li>" + texto + "</li>";\n}\n["Ahora con JavaScript", "Botones que responden", "Nébula 1.0 beta"].forEach((t) => agregar(t));',
      /Se borraron/,
    ));

  it("dd10: un oyente por cada li no sirve para las tareas nuevas", () =>
    falla(
      "dd10",
      'document.querySelectorAll("#pendientes li").forEach((li) => {\n  li.addEventListener("click", () => {\n    li.remove();\n    document.querySelector("#quedan").textContent = "Quedan " + document.querySelectorAll("#pendientes li").length;\n  });\n});',
      /un solo oyente/,
    ));

  it("dd10: sin comprobar e.target se borra la lista entera", () =>
    falla(
      "dd10",
      'document.querySelector("#pendientes").addEventListener("click", (e) => {\n  e.target.remove();\n  document.querySelector("#quedan").textContent = "Quedan " + document.querySelectorAll("#pendientes li").length;\n});',
      /LI/,
    ));

  it("dd11: sin preventDefault", () =>
    falla(
      "dd11",
      'document.querySelector("#registro").addEventListener("submit", () => {\n  let c = document.querySelector("#correo").value.trim();\n  if (c === "") document.querySelector("#error").textContent = "Falta el correo";\n  else { document.querySelector("#error").textContent = ""; document.querySelector("#gracias").textContent = "Apuntado: " + c; }\n});',
      /preventDefault/,
    ));

  it("dd11: sin trim, un correo de espacios pasa", () =>
    falla(
      "dd11",
      'document.querySelector("#registro").addEventListener("submit", (e) => {\n  e.preventDefault();\n  let c = document.querySelector("#correo").value;\n  if (c === "") document.querySelector("#error").textContent = "Falta el correo";\n  else { document.querySelector("#error").textContent = ""; document.querySelector("#gracias").textContent = "Apuntado: " + c; }\n});',
      /trim/,
    ));

  it("dd12: compara sin pasar a minúsculas", () =>
    falla(
      "dd12",
      'let b = document.querySelector("#buscar");\nlet items = document.querySelectorAll("#lista li");\nb.addEventListener("input", () => {\n  let v = 0;\n  items.forEach((li) => {\n    if (li.textContent.includes(b.value)) { li.style.display = ""; v++; } else { li.style.display = "none"; }\n  });\n  document.querySelector("#resultados").textContent = "Mostrando " + v + " de " + items.length;\n});',
      /minúsculas/,
    ));

  it("dd12: oculta pero nunca vuelve a mostrar", () =>
    falla(
      "dd12",
      'let b = document.querySelector("#buscar");\nlet items = document.querySelectorAll("#lista li");\nb.addEventListener("input", () => {\n  let v = 0;\n  items.forEach((li) => {\n    if (li.textContent.toLowerCase().includes(b.value.toLowerCase())) { v++; } else { li.style.display = "none"; }\n  });\n  document.querySelector("#resultados").textContent = "Mostrando " + v + " de " + items.length;\n});',
      /volver a verse/,
    ));
});
