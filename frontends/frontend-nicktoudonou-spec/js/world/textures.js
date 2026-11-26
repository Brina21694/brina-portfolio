/* ==========================================================================
   TEXTURES — tout le texte affiché DANS la 3D (écrans, cubes, plaques)
   est dessiné sur un <canvas>, puis collé sur les objets.
   ========================================================================== */

import * as THREE from "three";

const SANS = "Archivo, 'Arial Narrow', sans-serif";
const DISPLAY = "Syne, Archivo, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";
const SERIF = "'Instrument Serif', Georgia, serif";

export const COLORS = {
  night: "#0A0A0E", violet: "#1B1030", ivory: "#F2EEE5", ink: "#141418",
  amber: "#FFB36B", orange: "#FF7A3D", crimson: "#E8262E", bordeaux: "#7A1631", mist: "#A7A6B2",
};

/* Attendre les polices avant de dessiner (sinon le canvas prend une police système) */
export function fontsReady() {
  if (!document.fonts?.load) return Promise.resolve();
  return Promise.all([
    document.fonts.load(`800 64px Archivo`),
    document.fonts.load(`800 64px Syne`),
    document.fonts.load(`500 20px "IBM Plex Mono"`),
    document.fonts.load(`italic 64px "Instrument Serif"`),
  ]).catch(() => {});
}

function canvasTexture(w, h, draw, renderer) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer?.capabilities.getMaxAnisotropy?.() ?? 4;
  return t;
}

function font(ctx, weight, size, family = SANS, condensed = false) {
  ctx.font = `${weight} ${size}px ${family}`;
  if ("fontStretch" in ctx) ctx.fontStretch = condensed ? "condensed" : "normal";
}

function mono(ctx, text, x, y, size = 20, color = COLORS.mist, spacing = 3) {
  font(ctx, 500, size, MONO);
  ctx.fillStyle = color;
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${spacing}px`;
  ctx.fillText(String(text).toUpperCase(), x, y);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
}

function wrap(ctx, text, maxW, maxLines = 99) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "") + "…";
  }
  return lines;
}

/* Titre condensé qui rétrécit pour tenir dans la largeur */
function fitTitle(ctx, text, maxW, size, maxLines, weight = 800) {
  let s = size;
  let lines;
  do {
    font(ctx, weight, s, DISPLAY);
    lines = wrap(ctx, String(text).toUpperCase(), maxW, 99);
    s -= 4;
  } while ((lines.length > maxLines || lines.some((l) => ctx.measureText(l).width > maxW)) && s > 18);
  return { lines: lines.slice(0, maxLines), size: s + 4 };
}

function scanlines(ctx, w, h, alpha = 0.06) {
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1);
}

/* ---------- Écran géant de la ville : l'identité ---------- */
export function identityTexture(profil, renderer) {
  return canvasTexture(2048, 900, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#120A1E"); g.addColorStop(1, "#07060B");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = COLORS.amber; ctx.fillRect(0, 0, 14, h);
    mono(ctx, "Transmission · Rouen 49.44°N 1.10°E", 90, 96, 26, COLORS.amber, 6);
    mono(ctx, "Data World / 01", w - 420, 96, 26, COLORS.mist, 6);
    font(ctx, 800, 128, DISPLAY);
    ctx.fillStyle = COLORS.ivory;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "-4px";
    ctx.fillText("I TURN COMPLEX", 84, 300);
    ctx.fillText("DATA INTO", 84, 450);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    font(ctx, "italic 400", 220, SERIF);
    ctx.fillStyle = COLORS.amber;
    ctx.fillText("clarity.", 84, 660);
    const name = [profil?.prenom, profil?.nom].filter(Boolean).join(" ") || "Cédric Akle";
    font(ctx, 700, 44, DISPLAY);
    ctx.fillStyle = COLORS.ivory;
    ctx.fillText(name.toUpperCase(), w - 760, 640);
    mono(ctx, (profil?.titre ?? "Data Analyst").slice(0, 46), w - 760, 700, 24, COLORS.mist, 4);
    mono(ctx, "Explore · Discover · Understand", w - 760, 760, 24, COLORS.amber, 4);
    scanlines(ctx, w, h, 0.035);
  }, renderer);
}

/* ---------- Écran d'un terminal du Lab : un domaine de compétences ---------- */
export function terminalTexture(domain, index, renderer) {
  return canvasTexture(1024, 640, (ctx, w, h) => {
    ctx.fillStyle = "#0B0A0D"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = COLORS.crimson; ctx.fillRect(0, 0, w, 64);
    mono(ctx, `Lab / ${String(index + 1).padStart(2, "0")}`, 32, 42, 24, "#fff", 5);
    mono(ctx, `${domain.skills.length} compétence${domain.skills.length > 1 ? "s" : ""}`, w - 330, 42, 22, "#fff", 4);
    const t = fitTitle(ctx, domain.label, w - 64, 86, 1);
    font(ctx, 800, t.size, DISPLAY);
    ctx.fillStyle = COLORS.ivory;
    ctx.fillText(t.lines[0], 32, 170);
    const max = 5;
    domain.skills.slice(0, 4).forEach((s, i) => {
      const y = 228 + i * 82;
      font(ctx, 700, 32, DISPLAY);
      ctx.fillStyle = COLORS.ivory;
      ctx.fillText(s.nom.toUpperCase(), 32, y + 34);
      ctx.fillStyle = "rgba(242,238,229,0.1)";
      ctx.fillRect(470, y + 8, w - 600, 30);
      ctx.fillStyle = COLORS.crimson;
      ctx.fillRect(470, y + 8, (w - 600) * Math.min(1, s.valeur / max), 30);
      mono(ctx, s.affiche, w - 110, y + 34, 28, COLORS.ivory, 2);
    });
    mono(ctx, "Cliquer pour ouvrir", 32, h - 30, 20, COLORS.mist, 4);
    scanlines(ctx, w, h);
  }, renderer);
}

/* ---------- Face d'un cube de données : un projet ---------- */
export function cubeTexture(p, index, accent, renderer) {
  return canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#0D0B12"; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = accent; ctx.lineWidth = 6; ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = accent; ctx.fillRect(10, 10, 120, 46);
    mono(ctx, `P.${String(index + 1).padStart(2, "0")}`, 24, 42, 22, "#0A0A0E", 3);
    mono(ctx, p?.annee ?? "—", w - 110, 42, 22, COLORS.mist, 3);
    const t = fitTitle(ctx, p?.titre ?? "Offline", w - 60, 74, 3);
    font(ctx, 800, t.size, DISPLAY);
    ctx.fillStyle = COLORS.ivory;
    t.lines.forEach((l, i) => ctx.fillText(l, 30, 150 + i * t.size * 0.95));
    const tags = (p?.competences ?? []).slice(0, 4).join(" · ");
    mono(ctx, tags, 30, h - 40, 18, accent, 2);
  }, renderer);
}

/* ---------- Plaque du Journey : une étape du parcours ---------- */
export function plaqueTexture(step, renderer) {
  return canvasTexture(768, 1024, (ctx, w, h) => {
    ctx.fillStyle = COLORS.ivory; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = step.type === "formation" ? COLORS.bordeaux : COLORS.ink;
    ctx.fillRect(0, 0, w, 12);
    mono(ctx, step.type === "formation" ? "Formation" : "Expérience", 48, 84, 24, "#8E8A82", 5);
    font(ctx, 800, 120, DISPLAY);
    ctx.fillStyle = COLORS.ink;
    ctx.fillText(step.annee, 44, 220);
    mono(ctx, step.periode, 48, 270, 24, "#8E8A82", 4);
    const t = fitTitle(ctx, step.titre, w - 96, 64, 3, 800);
    font(ctx, 800, t.size, DISPLAY);
    ctx.fillStyle = COLORS.ink;
    t.lines.forEach((l, i) => ctx.fillText(l, 44, 370 + i * t.size * 0.98));
    const y0 = 370 + t.lines.length * t.size + 20;
    font(ctx, 600, 34, SANS);
    ctx.fillStyle = step.type === "formation" ? COLORS.bordeaux : "#C2410C";
    ctx.fillText(step.org, 44, y0);
    if (step.lieu) mono(ctx, `◇ ${step.lieu}`, 48, y0 + 46, 22, "#8E8A82", 3);
    font(ctx, 400, 28, SANS);
    ctx.fillStyle = "#3A3A40";
    wrap(ctx, step.description, w - 96, 6).forEach((l, i) => ctx.fillText(l, 44, y0 + 120 + i * 40));
    ctx.fillStyle = "rgba(20,20,24,0.12)"; ctx.fillRect(44, h - 90, w - 88, 2);
    mono(ctx, "Cliquer pour lire", 48, h - 46, 20, "#8E8A82", 4);
  }, renderer);
}

/* ---------- Enseigne d'une zone ---------- */
export function signTexture(num, name, accent, renderer) {
  return canvasTexture(1024, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 70, 8, 130);
    mono(ctx, `World ${num}`, 34, 98, 30, accent, 8);
    font(ctx, 800, 92, DISPLAY);
    ctx.fillStyle = "#FFF6EA";
    ctx.fillText(name.toUpperCase(), 28, 214);
  }, renderer);
}

/* ---------- Sol : grille fine (structure suisse, invisible) ---------- */
export function gridTexture(renderer) {
  const t = canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#0E0B12"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,190,150,0.10)";
    ctx.fillRect(0, 0, w, 2); ctx.fillRect(0, 0, 2, h);
    ctx.fillStyle = "rgba(255,190,150,0.04)";
    ctx.fillRect(0, h / 2, w, 1); ctx.fillRect(w / 2, 0, 1, h);
  }, renderer);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
