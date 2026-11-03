# Bíblia Uai

> A Sagrada Escritura contada por um mineiro que num tem pressa.

Uma edição de bolso em mineirês, feita de presente pra uma amiga mineira que ia encarar uma cirurgia. O site é neo-brutalista, tem chapéu de palha e pão de queijo soltos, e foi feito pra ser lido devagar — com café do lado.

![Capa da Bíblia Uai](assets/img/og.png)

**Site:** https://myckwilliam.github.io/biblia-uai/  
**Edição:** 219 versículos · 19 livros · 28 capítulos

## Amostra

> No começo de tudo, quando ainda num tinha nada, nada mesmo, Deus criou o céu e a terra. E foi assim, sem mais conversa.
>
> — Gênesis 1:1

> O Senhor é meu pastor. Num me falta nada, não.
>
> — Salmo 23:1

> Porque Deus amou o mundo de um jeito tão grande que deu o Filho único dele, pra que todo mundo que crê nele num morra, não, mas tenha a vida eterna.
>
> — João 3:16

## Como rodar

O site é estático, sem build e sem dependências:

```bash
python3 -m http.server 4173
# abra http://localhost:4173
```

Também funciona abrindo `index.html` direto no navegador: os dados são arquivos JS locais, sem `fetch`.

## Estrutura

```
index.html                 página única
assets/css/style.css       visual neo-brutalista
assets/js/app.js           leitor, sorteios, cópia e navegação
assets/img/                stickers (PNG + SVG de origem)
data/biblia.js             metadados, licença e versículos do dia
data/at.js                 Antigo Testamento adaptado
data/nt.js                 Novo Testamento adaptado
data/config.js             nome e recado da dedicação
scripts/expandir.mjs       pipeline opcional pra crescer o corpus
ESTILO.md                  guia de voz e regras de adaptação
```

## Personalizar

O nome e o recado da dedicatória ficam em `data/config.js`:

```js
window.BIBLIA_UAI_CONFIG = {
  nome: "minha amiga mineira",
  recado: "Que a cirurgia passe leve...",
  assinatura: "Com carinho, do seu amigo que num tem pressa."
};
```

Troque os textos entre aspas e recarregue. O resto do site se ajusta sozinho.

## Expandir o causo

A edição de bolso é uma seleção. Pra adaptar mais capítulos da BCC:

```bash
# mostra o prompt sem chamar o modelo
node scripts/expandir.mjs \
  --bcc ../verbum/assets/content/bible_bcc.json \
  --book gn --chapter 2 --dry-run

# adapta de verdade, usando a autenticação/modelo do OpenCode
node scripts/expandir.mjs \
  --bcc ../verbum/assets/content/bible_bcc.json \
  --book gn --chapter 2
```

O script lê o capítulo da BCC, monta o prompt com o guia de estilo, chama `opencode run` e salva o resultado em `data/gerado/`. Depois é só copiar o array de versículos pro livro certo em `data/at.js` ou `data/nt.js` e atualizar a contagem no `index.html` e neste README.

As regras de voz estão em [`ESTILO.md`](ESTILO.md). Vale ler antes de expandir.

## Licença e atribuição

- **Código do site:** MIT. Veja [`LICENSE`](LICENSE).
- **Texto adaptado:** CC BY-SA 4.0. Veja [`LICENSE-TEXTO.md`](LICENSE-TEXTO.md).

O texto foi adaptado da **BCC — Bíblia Clara Contemporânea**, distribuída sob CC BY-SA 4.0 e derivada da Bíblia Verbum Moderna (BVM), que deriva da Bíblia Livre. As adaptações em mineirês também são compartilhadas sob a mesma licença.

Esta é uma paródia afetuosa, não uma tradução oficial. Não há vínculo com a BCC, com a BVM ou com a Bíblia Livre.

## Créditos

- **Texto:** adaptação da BCC, com atribuição e share-alike preservados.
- **Stickers:** chapéu de palha e pão de queijo desenhados para este projeto em SVG e exportados em PNG com fundo transparente.
- **Tipografia:** Archivo Black, Space Grotesk e IBM Plex Mono (Google Fonts).

Feito com café, queijo e fé. Uai.
