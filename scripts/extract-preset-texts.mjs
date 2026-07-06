// Extracts human-visible copy strings from premium design source packs
// (premium-designs/<slug>-custom/<slug>/src/**) into lib/preset-texts.json.
// These strings are the "from" candidates for runtime text replacement —
// over-extraction is harmless because replacement happens on DOM text nodes,
// so non-copy strings (classNames, ids) never match anything on the page.
//
// Run: node scripts/extract-preset-texts.mjs

import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd());
const DESIGNS_DIR = path.join(ROOT, "premium-designs");
const OUT_FILE = path.join(ROOT, "lib", "preset-texts.json");

const MAX_STRINGS_PER_DESIGN = 400;

function looksLikeCopy(s) {
  const t = s.trim();
  if (t.length < 4 || t.length > 300) return false;
  if (!/[a-zA-Z]{2}/.test(t)) return false;
  // URLs, paths, mime types, imports
  if (/https?:\/\/|^\/|\.(tsx?|jsx?|css|svg|png|jpe?g|webp|woff2?|mp4|json)$/i.test(t)) return false;
  if (/^[\w-]+\/[\w-]+/.test(t)) return false;
  // CSS-ish values and tailwind class lists
  if (/(^|\s)(px|rem|em|vh|vw|deg|ms)\b|rgba?\(|var\(--|#[0-9a-fA-F]{3,8}\b|linear-gradient|cubic-bezier/.test(t)) return false;
  if (/^[a-z0-9\-_:.[\]/%#()@,!' ]+$/.test(t) && /-/.test(t) && !/\s[A-Za-z]+\s/.test(t)) return false;
  // identifiers / camelCase tokens without spaces
  if (!/\s/.test(t) && /^[a-z]/.test(t) && !/^[A-Z]/.test(t) && t.length < 12) return false;
  if (/^[A-Za-z]+([A-Z][a-z]+)+$/.test(t)) return false; // camelCase
  return true;
}

function extractFromSource(code) {
  const found = [];
  // JSX text nodes: >text<
  for (const m of code.matchAll(/>([^<>{}]+?)</g)) {
    const t = m[1].replace(/\s+/g, " ").trim();
    if (looksLikeCopy(t)) found.push(t);
  }
  // String literals (single, double quotes) — constants files hold most copy
  for (const m of code.matchAll(/'((?:[^'\\\n]|\\.){4,300})'/g)) {
    const t = m[1].replace(/\\'/g, "'").replace(/\s+/g, " ").trim();
    if (looksLikeCopy(t)) found.push(t);
  }
  for (const m of code.matchAll(/"((?:[^"\\\n]|\\.){4,300})"/g)) {
    const t = m[1].replace(/\\"/g, '"').replace(/\s+/g, " ").trim();
    if (looksLikeCopy(t)) found.push(t);
  }
  // Template literals without interpolation
  for (const m of code.matchAll(/`((?:[^`\\$]|\\.){4,300})`/g)) {
    const t = m[1].replace(/\s+/g, " ").trim();
    if (looksLikeCopy(t)) found.push(t);
  }
  return found;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(entry.name) && !/\.d\.ts$/.test(entry.name)) out.push(p);
  }
  return out;
}

const result = {};
for (const dirent of fs.readdirSync(DESIGNS_DIR, { withFileTypes: true })) {
  if (!dirent.isDirectory()) continue;
  const slug = dirent.name.replace(/-custom$/, "");
  const srcDir = path.join(DESIGNS_DIR, dirent.name, slug, "src");
  if (!fs.existsSync(srcDir)) {
    console.warn(`skip ${slug}: no src dir`);
    continue;
  }
  const seen = new Set();
  const strings = [];
  for (const file of walk(srcDir)) {
    for (const s of extractFromSource(fs.readFileSync(file, "utf8"))) {
      if (!seen.has(s)) {
        seen.add(s);
        strings.push(s);
      }
    }
  }
  result[slug] = strings.slice(0, MAX_STRINGS_PER_DESIGN);
  console.log(`${slug}: ${result[slug].length} strings`);
}

fs.writeFileSync(OUT_FILE, JSON.stringify(result, null, 1));
console.log(`\nWrote ${OUT_FILE} (${(fs.statSync(OUT_FILE).size / 1024).toFixed(0)} KB, ${Object.keys(result).length} designs)`);
