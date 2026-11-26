/* ==========================================================================
   ADMIN (#/admin) — routes 9 à 12. Page hors menu, protégée par la clé
   X-API-Key définie dans le .env du backend (ADMIN_API_KEY).
   La clé reste dans l'onglet (sessionStorage), jamais dans le code.
   ========================================================================== */

import { post, del } from "../api.js";
import { clearCache, loadProjets } from "../data.js";
import { esc, ARROW } from "../dom.js";

const FORMS = {
  experience: {
    label: "Expérience",
    route: "/api/experiences",
    fields: [
      ["entreprise", "Entreprise", true], ["poste", "Poste", true],
      ["lieu", "Lieu", true], ["debut", "Début (AAAA-MM)", true],
      ["fin", "Fin (AAAA-MM, vide = en cours)"], ["competences", "Compétences (slugs, séparés par des virgules)"],
      ["description", "Description", false, true],
    ],
  },
  formation: {
    label: "Formation",
    route: "/api/formations",
    fields: [
      ["ecole", "École", true], ["diplome", "Diplôme", true],
      ["lieu", "Lieu"], ["debut", "Début (AAAA-MM)", true], ["fin", "Fin (AAAA-MM)"],
    ],
  },
  projet: {
    label: "Projet",
    route: "/api/projets",
    fields: [
      ["projet_slug", "Slug (ex. mon-projet)", true], ["titre", "Titre", true],
      ["annee", "Année", true], ["competences", "Compétences (slugs, séparés par des virgules)", true],
      ["lien_repo", "Lien du code"], ["lien_demo", "Lien de la démo"],
      ["description", "Description courte", true, true], ["description_longue", "Description longue", false, true],
    ],
  },
};

const KEY = "portfolio-admin-key";
const readKey = () => { try { return sessionStorage.getItem(KEY) ?? ""; } catch { return ""; } };
const saveKey = (v) => { try { sessionStorage.setItem(KEY, v); } catch { /* navigation privée */ } };

function fieldHTML([name, label, required, long]) {
  const id = `f-${name}`;
  const input = long
    ? `<textarea id="${id}" name="${name}"${required ? " required" : ""}></textarea>`
    : `<input id="${id}" name="${name}"${required ? " required" : ""}${name === "annee" ? ' type="number" min="1990" max="2100"' : ""}>`;
  return `<div class="field${long ? " field--full" : ""}"><label class="mono" for="${id}">${esc(label)}${required ? " *" : ""}</label>${input}</div>`;
}

function toBody(form) {
  const body = {};
  for (const [k, v] of new FormData(form).entries()) {
    const value = String(v).trim();
    if (!value) continue;
    if (k === "competences") body[k] = value.split(",").map((s) => s.trim()).filter(Boolean);
    else if (k === "annee") body[k] = Number(value);
    else body[k] = value;
  }
  if (!("fin" in body) && form.elements.fin) body.fin = null;
  return body;
}

export function renderAdmin(app) {
  document.title = "Admin — Cédric Akle";
  let current = "experience";

  app.innerHTML = `
    <section class="admin on-ivory" data-section="A" data-accent="#E60012" data-label="Admin">
      <div class="container">
        <span class="mono muted">Accès candidat · routes 9 à 12</span>
        <h1 class="admin__title display">Admin</h1>

        <div class="admin__key">
          <div class="field" style="min-width:min(100%,360px)">
            <label class="mono" for="api-key">Clé admin (X-API-Key)</label>
            <input id="api-key" type="password" autocomplete="off" value="${esc(readKey())}">
          </div>
          <span class="mono muted">Gardée seulement dans cet onglet.</span>
        </div>

        <div class="chips admin__tabs" role="tablist">
          ${Object.entries(FORMS).map(([k, f]) => `<button class="chip" type="button" role="tab" data-form="${k}" aria-pressed="${k === current}">${f.label}</button>`).join("")}
          <button class="chip" type="button" role="tab" data-form="delete" aria-pressed="false">Supprimer un projet</button>
        </div>

        <div class="js-form"></div>
      </div>
    </section>`;

  const keyInput = app.querySelector("#api-key");
  keyInput.addEventListener("input", () => saveKey(keyInput.value));
  const box = app.querySelector(".js-form");

  const message = (el, ok, text) => {
    el.className = `form__msg ${ok ? "is-ok" : "is-err"}`;
    el.textContent = text;
  };

  const show = async (name) => {
    current = name;
    app.querySelectorAll(".admin__tabs .chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.form === name)));

    if (name === "delete") {
      const projets = await loadProjets().catch(() => []);
      box.innerHTML = `
        <form class="form">
          <div class="field field--full">
            <label class="mono" for="del-slug">Projet à supprimer *</label>
            <input id="del-slug" name="slug" list="del-list" required placeholder="slug du projet">
            <datalist id="del-list">${projets.map((p) => `<option value="${esc(p.slug)}">${esc(p.titre)}</option>`).join("")}</datalist>
          </div>
          <div class="form__actions"><button class="btn btn--ink" type="submit"><span class="btn__label">Supprimer définitivement</span><span class="btn__icon">${ARROW}</span></button><span class="js-msg form__msg" role="status"></span></div>
        </form>`;
      const form = box.querySelector("form");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const slug = form.slug.value.trim();
        const msg = form.querySelector(".js-msg");
        if (!confirm(`Supprimer « ${slug} » de MongoDB et Neo4j ?`)) return;
        try {
          await del(`/api/projets/${encodeURIComponent(slug)}`, keyInput.value);
          clearCache();
          message(msg, true, "Projet supprimé.");
          form.reset();
        } catch (error) {
          message(msg, false, `${error.status || ""} ${error.message}`.trim());
        }
      });
      return;
    }

    const def = FORMS[name];
    box.innerHTML = `
      <form class="form" novalidate>
        ${def.fields.map(fieldHTML).join("")}
        <div class="form__actions">
          <button class="btn btn--ink" type="submit"><span class="btn__label">Ajouter ${def.label.toLowerCase()}</span><span class="btn__icon">${ARROW}</span></button>
          <span class="js-msg form__msg" role="status"></span>
        </div>
      </form>`;
    const form = box.querySelector("form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = form.querySelector(".js-msg");
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const btn = form.querySelector("button");
      btn.disabled = true;
      try {
        await post(def.route, toBody(form), keyInput.value);
        clearCache();
        message(msg, true, `${def.label} ajouté(e). Le site se met à jour au prochain chargement.`);
        form.reset();
      } catch (error) {
        const hint = error.status === 401 ? " — clé admin absente ou fausse."
          : error.status === 422 ? " — vérifie les champs (compétences connues du profil ?)."
          : error.status === 502 ? " — enregistré dans MongoDB, synchronisation Neo4j à relancer." : "";
        message(msg, false, `${error.status || ""} ${error.message}${hint}`.trim());
      } finally {
        btn.disabled = false;
      }
    });
  };

  app.querySelector(".admin__tabs").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (b) show(b.dataset.form);
  });
  show(current);

  return () => {};
}
