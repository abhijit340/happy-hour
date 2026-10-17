// Builds index.html from tools/template.html and the data/*.json venue lists.
// Run from the project root:  node tools/build.js
// The template is the page body; this wraps it as a standalone, installable app page
// (system fonts only, no CDN), merges the venue data, and stamps the check date.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const CHECKED = process.argv[2] || "October 17, 2026";

let all = [];
for (const f of ["hh-caphill.json", "hh-belltown.json", "hh-pike.json"]) {
  all = all.concat(JSON.parse(fs.readFileSync(path.join(root, "data", f), "utf8")));
}
const seen = new Set();
all = all.filter((d) => { const k = d.name.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });

let body = fs.readFileSync(path.join(__dirname, "template.html"), "utf8");
// Drop artifact-only head bits and the web-font links; the app uses system fonts.
body = body
  .replace(/<title>[^<]*<\/title>\s*/, "")
  .replace(/<meta name="claude:viewport-fit-sides"[^>]*>\s*/, "")
  .replace(/<link rel="preconnect"[^>]*>\s*/g, "")
  .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>\s*/g, "")
  .replace(/--display: "Barlow Condensed",[^;]*;/, '--display: "Barlow Condensed", "Roboto Condensed", "Arial Narrow", "Helvetica Neue Condensed", system-ui, sans-serif;')
  .replace(/--body: "Public Sans",[^;]*;/, '--body: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;')
  .replace("/*DATA*/[]", JSON.stringify(all))
  .replace("/*CHECKED*/", CHECKED)
  .replace(/  render\(\);\r?\n  setInterval\(/, '  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(function () {});\n  render();\n  setInterval(');
if (!body.includes('register("sw.js")')) throw new Error("build: could not add the service worker registration");

const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#f4f5f2" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#121513" media="(prefers-color-scheme: dark)">
<meta name="description" content="Which Seattle happy hours are on right now, sorted by minutes left.">
<title>Happy Hour Now</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<style>:root { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); } body { margin: 0; } [hidden] { display: none !important; }</style>
</head>
<body>
`;
fs.writeFileSync(path.join(root, "index.html"), head + body + "\n</body>\n</html>\n");
const live = all.filter((d) => d.status !== "closed" && d.windows && d.windows.length);
console.log(`index.html: ${live.length} venues listed (${live.filter((d) => d.source_type === "official").length} from venue sites, ${live.filter((d) => d.oysters).length} with oysters), checked ${CHECKED}`);
