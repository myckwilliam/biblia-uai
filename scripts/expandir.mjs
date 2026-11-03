#!/usr/bin/env node
/**
 * Adapta um capítulo da BCC para o mineirês usando o OpenCode.
 *
 * Uso:
 *   node scripts/expandir.mjs --bcc ../verbum/assets/content/bible_bcc.json \
 *     --book gn --chapter 2
 *
 * Opções:
 *   --bcc <arquivo>    caminho do bible_bcc.json (obrigatório)
 *   --book <abbr>      abreviação ou nome do livro (obrigatório)
 *   --chapter <n>      número do capítulo (obrigatório)
 *   --model <id>       modelo no formato provider/model (opcional)
 *   --out <arquivo>    caminho de saída (opcional)
 *   --dry-run          só imprime o prompt, sem chamar o modelo
 *
 * O resultado é salvo em data/gerado/<abbr>-<capítulo>.json e precisa ser
 * revisado antes de entrar no site.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);

function option(name, fallback = null) {
  const index = args.indexOf(`--${name}`);
  if (index === -1) return fallback;
  return args[index + 1] ?? fallback;
}

function hasFlag(name) {
  return args.includes(`--${name}`);
}

const bccPath = option("bcc");
const bookQuery = option("book");
const chapterNumber = Number(option("chapter"));
const model = option("model");
const outPath = option("out");
const dryRun = hasFlag("dry-run");

if (!bccPath || !bookQuery || !Number.isInteger(chapterNumber) || chapterNumber < 1) {
  console.error(`
Uso:
  node scripts/expandir.mjs --bcc <bible_bcc.json> --book <abbr> --chapter <n> [--model <id>] [--out <arquivo>] [--dry-run]

Exemplo:
  node scripts/expandir.mjs --bcc ../verbum/assets/content/bible_bcc.json --book gn --chapter 2
`);
  process.exit(1);
}

if (!fs.existsSync(bccPath)) {
  console.error(`Num achei o arquivo da BCC: ${bccPath}`);
  process.exit(1);
}

const bcc = JSON.parse(fs.readFileSync(bccPath, "utf8"));
const normalized = bookQuery.toLowerCase();

const book = bcc.books.find(
  (item) =>
    item.abbreviation.toLowerCase() === normalized ||
    item.name.toLowerCase() === normalized
);

if (!book) {
  console.error(`Num achei o livro "${bookQuery}". Abreviações: ${bcc.books.map((item) => item.abbreviation).join(", ")}`);
  process.exit(1);
}

const chapter = book.chapters[chapterNumber - 1];
if (!chapter || !Array.isArray(chapter) || chapter.length === 0) {
  console.error(`O livro ${book.name} num tem o capítulo ${chapterNumber}.`);
  process.exit(1);
}

const sourceLines = chapter
  .map((text, index) => `${index + 1}: ${text}`)
  .join("\n");

const prompt = `Você é um contador de causos mineiro, da roça, calmo e espirituoso. Sua tarefa é adaptar um capítulo da Bíblia para o mineirês, mantendo o sentido, a ordem e o número de versículos.

REGRAS DE VOZ
- Fale como um mineiro estereotipado, mas carinhoso e respeitoso. Use "ocê", "ocês", "num" antes do verbo, "tá", "pra", "que nem".
- Pode usar "uai", "sô", "causo", "trem", "bão", "benza Deus", "demais da conta" — com moderação. Não repita "uai" em todo versículo.
- O humor vem do jeito de contar e das comparações com a roça, nunca de deboche da fé ou das pessoas.
- Mantenha nomes próprios e termos teológicos (Deus, Jesus, Cristo, Espírito Santo, profeta, apóstolo, manjedoura etc.).
- Em passagens de dor, doença ou morte, deixe o humor de lado e use ternura.
- Cada versículo deve ter 1 a 3 frases, legível em voz alta.

REGRAS DE FIDELIDADE
- Uma entrada por versículo, na mesma ordem e com o mesmo número.
- Não invente cenas, personagens ou doutrina.
- Não omita a ideia central de nenhum versículo.
- Não corte versículos nem junte dois em um.

FORMATO DA RESPOSTA
Responda APENAS com um array JSON válido, sem markdown e sem comentários, neste formato:
[[1,"texto do versículo 1"],[2,"texto do versículo 2"]]

O array deve ter exatamente ${chapter.length} itens, numerados de 1 a ${chapter.length}.

TEXTO BASE — ${book.name} ${chapterNumber} (BCC — Bíblia Clara Contemporânea, CC BY-SA 4.0):
${sourceLines}`;

if (dryRun) {
  console.log(prompt);
  process.exit(0);
}

const commandArgs = ["run"];
if (model) commandArgs.push("--model", model);
commandArgs.push(prompt);

console.log(`Adaptando ${book.name} ${chapterNumber} (${chapter.length} versículos) com o OpenCode...`);

const result = spawnSync("opencode", commandArgs, {
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024,
  timeout: 10 * 60 * 1000
});

if (result.error) {
  console.error(`Num deu pra chamar o OpenCode: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(`O OpenCode saiu com código ${result.status}.`);
  if (result.stderr) console.error(result.stderr.trim());
  process.exit(1);
}

const raw = String(result.stdout || "").trim();
const start = raw.indexOf("[");
const end = raw.lastIndexOf("]");

if (start === -1 || end === -1 || end <= start) {
  console.error("O modelo num devolveu um array JSON. Saída bruta:");
  console.error(raw.slice(0, 2000));
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(raw.slice(start, end + 1));
} catch (error) {
  console.error(`O JSON veio quebrado: ${error.message}`);
  console.error(raw.slice(0, 2000));
  process.exit(1);
}

if (!Array.isArray(parsed) || parsed.length !== chapter.length) {
  console.error(`Esperava ${chapter.length} versículos, recebi ${Array.isArray(parsed) ? parsed.length : "outra coisa"}.`);
  process.exit(1);
}

const verses = parsed.map((item, index) => {
  if (
    !Array.isArray(item) ||
    item.length !== 2 ||
    item[0] !== index + 1 ||
    typeof item[1] !== "string" ||
    !item[1].trim()
  ) {
    console.error(`O versículo ${index + 1} veio fora do formato.`);
    console.error(JSON.stringify(item));
    process.exit(1);
  }
  return [item[0], item[1].trim()];
});

const output = outPath || path.join("data", "gerado", `${book.abbreviation}-${chapterNumber}.json`);
fs.mkdirSync(path.dirname(output), { recursive: true });

const payload = {
  book: {
    id: book.abbreviation,
    name: book.name
  },
  chapter: chapterNumber,
  source: "BCC — Bíblia Clara Contemporânea (CC BY-SA 4.0)",
  generatedBy: "opencode run",
  verses
};

fs.writeFileSync(output, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(`Pronto: ${output}`);
console.log("Revisa o texto com calma antes de colar em data/at.js ou data/nt.js.");
