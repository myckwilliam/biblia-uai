(() => {
  "use strict";

  const DATA = window.BIBLIA_UAI;
  const CONFIG = window.BIBLIA_UAI_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  if (!DATA) {
    document.body.innerHTML = "<p style='padding:2rem;font-family:sans-serif'>Num achei os causos. Confere se a pasta <code>data/</code> veio junto.</p>";
    return;
  }

  const ACCENTS = [
    "var(--yellow)",
    "var(--pink)",
    "var(--green)",
    "var(--blue)",
    "var(--purple)",
    "var(--orange)"
  ];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollBehavior = reduceMotion ? "auto" : "smooth";

  const booksById = Object.fromEntries(DATA.books.map((book) => [book.id, book]));
  const allVerses = [];

  DATA.books.forEach((book) => {
    book.chapters.forEach((chapter) => {
      chapter.verses.forEach(([number, text]) => {
        allVerses.push({ book, chapter, number, text });
      });
    });
  });

  const bookSelect = $("#book-select");
  const chapterSelect = $("#chapter-select");
  const verseList = $("#verse-list");
  const bookGrid = $("#book-grid");
  const toast = $("#toast");
  const dailyText = $("#daily-text");
  const dailyRefEl = $("#daily-ref");
  const dailyDate = $("#daily-date");
  const copyDaily = $("#copy-daily");

  let current = { bookId: "gn", chapter: 1 };
  let currentDaily = null;
  let toastTimer = null;
  let targetTimer = null;

  /* Personalização */
  $$("[data-config]").forEach((element) => {
    const value = CONFIG[element.dataset.config];
    if (value) element.textContent = value;
  });

  /* Utilidades */
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
  }

  async function copyText(text, message = "Copiado, uai!") {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message);
      return;
    } catch (error) {
      /* alguns navegadores bloqueiam a API em file:// */
    }

    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();

    try {
      document.execCommand("copy");
      showToast(message);
    } catch (error) {
      showToast("Num deu pra copiar, não. Seleciona na mão.");
    } finally {
      helper.remove();
    }
  }

  function findVerse(bookId, chapterNumber, verseNumber) {
    const book = booksById[bookId];
    if (!book) return null;
    const chapter = book.chapters.find((item) => item.number === Number(chapterNumber));
    if (!chapter) return null;
    const verse = chapter.verses.find((item) => item[0] === Number(verseNumber));
    if (!verse) return null;
    return { book, chapter, number: verse[0], text: verse[1] };
  }

  function formatReference(book, chapter, number) {
    return `${book.name} ${chapter.number}:${number}`;
  }

  function dayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  }

  function pickIndex(key, length) {
    let hash = 0;
    for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return hash % length;
  }

  /* Leitor */
  function fillBookOptions() {
    bookSelect.innerHTML = "";
    DATA.books.forEach((book) => {
      const option = document.createElement("option");
      option.value = book.id;
      option.textContent = book.name;
      bookSelect.appendChild(option);
    });
  }

  function fillChapterOptions(bookId, selected) {
    const book = booksById[bookId];
    chapterSelect.innerHTML = "";
    book.chapters.forEach((chapter) => {
      const option = document.createElement("option");
      option.value = String(chapter.number);
      option.textContent = `Capítulo ${chapter.number}`;
      chapterSelect.appendChild(option);
    });
    chapterSelect.value = String(selected ?? book.chapters[0].number);
  }

  function renderChapter(bookId, chapterNumber, options = {}) {
    const book = booksById[bookId];
    if (!book) return;

    const chapter = book.chapters.find((item) => item.number === Number(chapterNumber)) || book.chapters[0];
    current = { bookId, chapter: chapter.number };

    bookSelect.value = bookId;
    fillChapterOptions(bookId, chapter.number);

    $("#reader-testament").textContent = book.testament === "AT" ? "Antigo Testamento" : "Novo Testamento";
    $("#reader-title").textContent = `${book.name} ${chapter.number}`;

    verseList.innerHTML = "";
    verseList.setAttribute("role", "list");

    chapter.verses.forEach(([number, text], index) => {
      const verse = document.createElement("article");
      verse.className = "verse";
      verse.dataset.verse = String(number);
      verse.setAttribute("role", "listitem");
      verse.style.setProperty("--accent", ACCENTS[index % ACCENTS.length]);

      const numberEl = document.createElement("span");
      numberEl.className = "verse-num";
      numberEl.setAttribute("aria-hidden", "true");
      numberEl.textContent = String(number);

      const textEl = document.createElement("p");
      textEl.className = "verse-text";
      textEl.textContent = text;

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "verse-copy";
      copyButton.textContent = "copiar";
      copyButton.dataset.copyText = text;
      copyButton.dataset.copyLabel = formatReference(book, chapter, number);
      copyButton.setAttribute("aria-label", `Copiar ${formatReference(book, chapter, number)}`);

      verse.append(numberEl, textEl, copyButton);
      verseList.appendChild(verse);
    });

    if (options.updateHash !== false) {
      try {
        history.replaceState(null, "", `#ler/${bookId}/${chapter.number}`);
      } catch (error) {
        /* file:// pode reclamar do replaceState */
      }
    }

    if (options.scroll) {
      $("#ler").scrollIntoView({ behavior: scrollBehavior, block: "start" });
    }

    if (options.highlightVerse) {
      highlightVerse(options.highlightVerse, options.scroll === false);
    }
  }

  function highlightVerse(number, shouldScroll = true) {
    window.clearTimeout(targetTimer);
    $$(".verse.is-target").forEach((element) => element.classList.remove("is-target"));
    const target = verseList.querySelector(`[data-verse="${number}"]`);
    if (!target) return;

    target.classList.add("is-target");

    if (shouldScroll) {
      target.scrollIntoView({ behavior: scrollBehavior, block: "center" });
    }

    targetTimer = window.setTimeout(() => target.classList.remove("is-target"), 2800);
  }

  function goToVerse(verse, options = {}) {
    const alreadyOpen = current.bookId === verse.book.id && current.chapter === verse.chapter.number;
    if (alreadyOpen) {
      highlightVerse(verse.number, options.scroll !== false);
      return;
    }
    renderChapter(verse.book.id, verse.chapter.number, {
      updateHash: true,
      scroll: false,
      highlightVerse: verse.number
    });
  }

  function randomVerse() {
    if (!allVerses.length) return;
    const verse = allVerses[Math.floor(Math.random() * allVerses.length)];
    goToVerse(verse);
  }

  /* Livros */
  function buildBookGrid() {
    bookGrid.innerHTML = "";

    DATA.books.forEach((book, index) => {
      const chapterCount = book.chapters.length;
      const verseCount = book.chapters.reduce((total, chapter) => total + chapter.verses.length, 0);
      const card = document.createElement("article");
      card.className = "book-card";
      card.style.setProperty("--accent", ACCENTS[index % ACCENTS.length]);

      const top = document.createElement("div");
      top.className = "book-card-top";

      const badge = document.createElement("span");
      badge.className = "book-badge";
      badge.textContent = book.abbr;

      const testament = document.createElement("span");
      testament.className = "book-testament";
      testament.textContent = book.testament;

      top.append(badge, testament);

      const title = document.createElement("h3");
      title.textContent = book.name;

      const meta = document.createElement("p");
      meta.className = "book-meta";
      meta.textContent = `${chapterCount} ${chapterCount === 1 ? "capítulo" : "capítulos"} · ${verseCount} versículos`;

      const chapters = document.createElement("div");
      chapters.className = "book-chapters";

      book.chapters.forEach((chapter) => {
        const pill = document.createElement("button");
        pill.type = "button";
        pill.className = "chapter-pill";
        pill.dataset.book = book.id;
        pill.dataset.chapter = String(chapter.number);
        pill.textContent = chapterCount === 1 ? "Ler capítulo 1" : `Cap. ${chapter.number}`;
        chapters.appendChild(pill);
      });

      card.append(top, title, meta, chapters);
      bookGrid.appendChild(card);
    });
  }

  /* Versículo do dia */
  function setDaily(ref, options = {}) {
    if (!ref) return;
    const found = findVerse(ref[0], ref[1], ref[2]);
    if (!found) return;

    currentDaily = found;
    dailyText.textContent = found.text;
    dailyRefEl.textContent = `— ${formatReference(found.book, found.chapter, found.number)}`;
    copyDaily.dataset.copyText = found.text;
    copyDaily.dataset.copyLabel = formatReference(found.book, found.chapter, found.number);

    if (options.scroll) {
      $("#do-dia").scrollIntoView({ behavior: scrollBehavior, block: "start" });
    }
  }

  function setDailyDate() {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long"
    });
    dailyDate.textContent = formatter.format(new Date());
  }

  function initialDaily() {
    setDailyDate();
    if (!Array.isArray(DATA.meta.daily) || !DATA.meta.daily.length) {
      const random = allVerses[Math.floor(Math.random() * allVerses.length)];
      if (random) {
        setDaily([random.book.id, random.chapter.number, random.number]);
      }
      return;
    }
    const ref = DATA.meta.daily[pickIndex(dayKey(), DATA.meta.daily.length)];
    setDaily(ref);
  }

  function anotherDaily() {
    const refs = DATA.meta.daily;
    if (!Array.isArray(refs) || refs.length < 2) {
      randomVerse();
      return;
    }

    let next = refs[Math.floor(Math.random() * refs.length)];
    let guard = 0;
    while (
      currentDaily &&
      next[0] === currentDaily.book.id &&
      Number(next[1]) === currentDaily.chapter.number &&
      Number(next[2]) === currentDaily.number &&
      guard < 12
    ) {
      next = refs[Math.floor(Math.random() * refs.length)];
      guard += 1;
    }
    setDaily(next);
  }

  /* Eventos */
  bookSelect.addEventListener("change", () => {
    const book = booksById[bookSelect.value];
    if (!book) return;
    renderChapter(book.id, book.chapters[0].number);
  });

  chapterSelect.addEventListener("change", () => {
    renderChapter(bookSelect.value, Number(chapterSelect.value), { updateHash: true });
  });

  bookGrid.addEventListener("click", (event) => {
    const pill = event.target.closest(".chapter-pill");
    if (!pill) return;
    renderChapter(pill.dataset.book, Number(pill.dataset.chapter), { scroll: true });
  });

  $("#random-verse").addEventListener("click", randomVerse);
  $("#hero-random").addEventListener("click", randomVerse);
  $("#daily-random").addEventListener("click", anotherDaily);

  $("#copy-chapter").addEventListener("click", () => {
    const book = booksById[current.bookId];
    const chapter = book?.chapters.find((item) => item.number === current.chapter);
    if (!book || !chapter) return;

    const body = chapter.verses.map(([number, text]) => `${number}. ${text}`).join("\n\n");
    copyText(
      `${book.name} ${chapter.number} — Bíblia Uai\n\n${body}`,
      "Capítulo copiado, uai!"
    );
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-copy-text]");
    if (!button) return;
    const label = button.dataset.copyLabel || "Bíblia Uai";
    copyText(`“${button.dataset.copyText}” — ${label} (Bíblia Uai)`);
  });

  $("#share-site").addEventListener("click", async () => {
    const url = window.location.href.split("#")[0];
    const shareData = {
      title: "Bíblia Uai",
      text: "A Sagrada Escritura contada por um mineiro que num tem pressa.",
      url
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error.name === "AbortError") return;
      }
    }
    copyText(url, "Link copiado, uai!");
  });

  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.replace(/^#/, "");
    const parts = hash.split("/");
    if (parts[0] === "ler" && parts[1]) {
      const book = booksById[parts[1]];
      if (!book) return;
      const chapter = Number(parts[2]);
      if (book.chapters.some((item) => item.number === chapter)) {
        renderChapter(book.id, chapter, { updateHash: false });
      }
    }
  });

  /* Boot */
  buildBookGrid();
  fillBookOptions();
  initialDaily();

  const hash = window.location.hash.replace(/^#/, "");
  const parts = hash.split("/");
  if (parts[0] === "ler" && parts[1] && booksById[parts[1]]) {
    const book = booksById[parts[1]];
    const chapter = Number(parts[2]);
    if (book.chapters.some((item) => item.number === chapter)) {
      renderChapter(book.id, chapter, { updateHash: false });
    } else {
      renderChapter(book.id, book.chapters[0].number, { updateHash: false });
    }
  } else {
    renderChapter("gn", 1, { updateHash: false });
  }
})();
