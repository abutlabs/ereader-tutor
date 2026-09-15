// Table-of-contents helper. A book's chapters come from its metadata when the
// bridge (PDF outline) or an import supplied them; otherwise they are derived
// from the pages themselves, so the contents are always available — a book
// synced before chapters existed, or an older export, still gets a usable TOC.

import type { Book } from "./schema";

export interface ChapterInfo {
  number: number;
  title: string;
  firstIdx: number; // index into book.pages of the chapter's first page (-1 if none yet)
  count: number;
}

// Page titles that read as a chapter opener when no chapter metadata exists.
const OPENER = /^(chapter|part|book|preface|prologue|introduction|epilogue|appendix|chapitre|partie|préface|prologue|épilogue|hoofdstuk|deel|voorwoord)\b/i;

export function bookChapters(book: Book): {
  chapters: ChapterInfo[];
  chapterOf: (pageIdx: number) => number | undefined;
} {
  const meta = book.meta.chapters ?? [];
  if (meta.length) {
    const chapters = meta.map((ch) => ({
      number: ch.number,
      title: ch.title,
      firstIdx: book.pages.findIndex((p) => p.chapter === ch.number),
      count: book.pages.filter((p) => p.chapter === ch.number).length,
    }));
    return { chapters, chapterOf: (i) => book.pages[i]?.chapter };
  }
  // Derive from page titles: each opener-looking title starts a chapter.
  const byIdx: (number | undefined)[] = [];
  const chapters: ChapterInfo[] = [];
  let cur: ChapterInfo | undefined;
  book.pages.forEach((p, i) => {
    if (p.title && OPENER.test(p.title.trim())) {
      cur = { number: chapters.length + 1, title: p.title.trim(), firstIdx: i, count: 0 };
      chapters.push(cur);
    }
    if (cur) cur.count++;
    byIdx.push(cur?.number);
  });
  return { chapters, chapterOf: (i) => byIdx[i] };
}
