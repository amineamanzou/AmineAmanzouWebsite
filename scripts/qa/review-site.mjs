import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

const requiredFiles = [
  "index.html",
  "cv/index.html",
  "contact/index.html",
  "blog/index.html",
  "articles/index.html",
  "downloads/amine-amanzou-dossier-competence-fr.pdf",
  "downloads/amine-amanzou-resume-en.pdf",
  "images/amine-amanzou-profile.jpeg",
];

const requiredHomeText = [
  "systèmes critiques observables",
  "Enedis",
  "Odigo",
  "Ylio",
  "Orange",
  "Voir le CV",
  "Me contacter",
];

const requiredCvText = [
  "Expérience professionnelle",
  "Expert Observabilité",
  "Lead SRE Data",
  "Formation et certifications",
];

const requiredContactText = [
  "amineamanzou@gmail.com",
  "LinkedIn",
  "GitHub",
  "X / Twitter",
  "Portfolio photo",
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function html(path) {
  return readFileSync(join(dist, path), "utf8");
}

for (const file of requiredFiles) {
  assert(existsSync(join(dist, file)), `Missing dist artifact: ${file}`);
}

const home = html("index.html");
const cv = html("cv/index.html");
const contact = html("contact/index.html");
const blog = html("blog/index.html");
const articles = html("articles/index.html");

for (const text of requiredHomeText) {
  assert(home.includes(text), `Home missing expected text: ${text}`);
}

for (const text of requiredCvText) {
  assert(cv.includes(text), `CV missing expected text: ${text}`);
}

for (const text of requiredContactText) {
  assert(contact.includes(text), `Contact missing expected text: ${text}`);
}

assert(blog.includes("url=/") || blog.includes("url=/"), "Blog redirect page missing refresh target");
assert(articles.includes("url=/") || articles.includes("url=/"), "Articles redirect page missing refresh target");

console.log("Static site review passed");
