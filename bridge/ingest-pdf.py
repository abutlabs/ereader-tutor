#!/usr/bin/env python3
# PDF ingester — turn a purchased/DRM-free PDF into bridge page folders, so the
# existing bridge pipeline (enrich → page.html → index → narrate → phone sync)
# picks them up exactly as if they had been scanned with the phone camera.
#
#     python3 bridge/ingest-pdf.py book.pdf --book "Le Petit Prince" \
#         --source French --target English --pages 9-40
#
# Two modes:
#   --mode text    (default) read the PDF's text layer here (free, instant) and
#                  write transcript.json + native.txt, i.e. stage 1 already done.
#                  The bridge resumes each page at stage 2 (enrich). The page is
#                  also rendered to source.jpg as artwork when PyMuPDF is present.
#   --mode vision  render each page to source.jpg only, and let the bridge's
#                  Claude-vision stage 1 transcribe it. Use this for scanned PDFs
#                  (no text layer) or image-heavy layouts (maps, captions) where
#                  text extraction comes out in a scrambled order.
#
# Own the book only in another language? --translate-to makes the bridge
# translate each page first (Claude, sentence for sentence) and build the
# lessons on the translation, with the PDF's own text passed through as the
# lesson translation:
#
#     python3 bridge/ingest-pdf.py atlas.pdf --book "Atlas de Tolkien" \
#         --source English --translate-to French --target English --pages 19-31
#
# Afterwards (re)start the bridge — `node bridge/server.mjs` — and it recovers
# the queued pages from disk. Each page costs one Claude run under your Max
# plan, so ingest a chapter at a time with --pages rather than a whole book.
#
# Requires:  pip3 install pypdf pymupdf      (pymupdf optional: page artwork /
#                                             vision mode only)

import argparse
import glob
import json
import os
import re
import shutil
import statistics
import sys
import time

try:
    import pypdf
except ImportError:
    sys.exit("pypdf is required:  pip3 install pypdf")

try:
    import pymupdf  # PyMuPDF ≥ 1.24
except ImportError:
    try:
        import fitz as pymupdf  # older PyMuPDF
    except ImportError:
        pymupdf = None

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_PROJECTS = os.path.join(HERE, "..", "projects")

# Lines that are never body text: distributor watermarks, bare page numbers,
# running heads made only of digits / roman numerals.
JUNK_LINE = re.compile(
    r"^\s*(?:oceanofpdf\.com|www\.[\w.-]+|[\divxlc]+|page\s+\d+)\s*$", re.I
)

# Abbreviations that end with a period but do not end a sentence. Mixed
# English + French + Dutch; add to taste.
ABBREV = {
    "mr", "mrs", "ms", "dr", "prof", "st", "jr", "sr", "vs", "etc", "no", "vol",
    "fig", "ch", "chap", "p", "pp", "ed", "eds", "trans", "cf", "e.g", "i.e",
    "m", "mme", "mlle", "mm", "mgr", "me", "dhr", "mevr", "mej", "bijv", "enz",
    "a.d", "b.c", "s.a", "s.r",
}

TERMINAL = '.!?…'
CLOSERS = '"\u201d\u2019\u00bb)'


# ── Text clean-up ───────────────────────────────────────────────────────────
def mk_book_name(title: str) -> str:
    # Mirrors safeBookName() in server.mjs so folders line up with the app.
    s = re.sub(r"[^\w \-]", "", title.strip(), flags=re.U).strip()
    s = re.sub(r"\s+", "_", s)
    return s or "Untitled"


def clean_lines(raw: str) -> list:
    lines = []
    for ln in raw.replace("\r", "").split("\n"):
        ln = ln.replace("\u00ad", "")  # soft hyphen
        ln = re.sub(r"[ \t\u00a0]+", " ", ln).strip()
        if JUNK_LINE.match(ln):
            continue
        lines.append(ln)
    return lines


def dehyphenate(prev: str, nxt: str, known_hyphenated: set) -> str:
    """Join a line ending in '-' with the next. Keeps the hyphen when the
    joined form is a real hyphenated word seen elsewhere (Middle-earth)."""
    left = prev[:-1]
    m_l = re.search(r"(\S+)$", left)
    m_r = re.match(r"(\S+)", nxt)
    if m_l and m_r:
        cand = f"{m_l.group(1)}-{m_r.group(1)}"
        if cand.lower().rstrip(",.;:!?") in known_hyphenated:
            return prev + nxt
    return left + nxt


def lines_to_paragraphs(lines: list, known_hyphenated: set) -> tuple:
    """Reflow extracted lines into paragraph strings.

    A paragraph ends at a blank line, or at a line noticeably shorter than the
    page's typical full line when the next line starts a new one. Returns
    (paragraphs, last_open): last_open is True when the final paragraph was cut
    off by the page end rather than closed by a short line — i.e. it may spill
    onto the next page."""
    lens = [len(l) for l in lines if l]
    full = max(lens) if lens else 0
    typical = statistics.median(lens) if lens else 0
    short_cut = max(typical * 0.75, full * 0.6) if lens else 0

    paras, cur = [], ""
    last_open = False
    for i, ln in enumerate(lines):
        if not ln:
            if cur:
                paras.append(cur)
                cur = ""
            continue
        if cur.endswith("-") and ln[:1].islower():
            cur = dehyphenate(cur, ln, known_hyphenated)
        else:
            cur = f"{cur} {ln}" if cur else ln
        # A short line ends a paragraph when the next line starts a new one
        # (capital/quote). In justified text only a paragraph's last line is
        # short, so this also separates unpunctuated picture captions from
        # the body text instead of gluing them onto the next sentence.
        nxt = lines[i + 1] if i + 1 < len(lines) else ""
        next_starts_cap = bool(nxt) and (nxt[0].isupper() or nxt[0] in '"“«')
        if (len(ln) < short_cut and (not nxt or next_starts_cap)
                and not cur.endswith("-") and ln.rstrip()[-1:] not in ",;:"):
            paras.append(cur)
            cur = ""
    if cur:
        paras.append(cur)
        last_open = True
    return [re.sub(r"\s+", " ", p).strip() for p in paras if p.strip()], last_open


def split_sentences(text: str) -> list:
    out, buf = [], ""
    i, n = 0, len(text)
    while i < n:
        ch = text[i]
        buf += ch
        if ch in TERMINAL:
            # swallow a run of terminal marks and closing quotes/brackets —
            # including a closer after a space, as in French « … digestion. »
            j = i + 1
            while j < n:
                if text[j] in TERMINAL or text[j] in CLOSERS:
                    buf += text[j]
                    j += 1
                elif text[j] == " " and j + 1 < n and text[j + 1] in CLOSERS:
                    buf += text[j] + text[j + 1]
                    j += 2
                else:
                    break
            # sentence ends here if followed by whitespace + (uppercase | quote | digit)
            k = j
            while k < n and text[k] == " ":
                k += 1
            nxt = text[k] if k < n else ""
            word = re.search(r"(\S+)\.$", buf.rstrip(CLOSERS + "!?…"))
            is_abbrev = bool(word) and word.group(1).lower().lstrip('("“«') in ABBREV
            initial = bool(word) and re.fullmatch(r"[A-Z]", word.group(1)) is not None
            if (not nxt) or (nxt and (nxt.isupper() or nxt in '"“«' or nxt.isdigit()) and not is_abbrev and not initial):
                out.append(buf.strip())
                buf = ""
            i = k if nxt else j
            continue
        i += 1
    if buf.strip():
        out.append(buf.strip())
    return [s for s in out if len(s) > 1]


def ends_sentence(s: str) -> bool:
    return s.rstrip(CLOSERS)[-1:] in TERMINAL


def norm(s: str) -> str:
    return re.sub(r"[^\w]+", " ", s.lower()).strip()


def lift_heading(lines: list, title):
    """Pull a heading off the top of the page so it isn't glued into the first
    sentence. Uses the PDF outline title when the page starts with it; otherwise
    a short, unpunctuated, capitalised first line followed by a capitalised line
    is taken as the heading."""
    body = [l for l in lines if l]
    if not body:
        return lines, title
    first = body[0]
    if title and norm(first) == norm(title):
        return body[1:], title
    if title is None and len(body) > 1:
        typical = statistics.median(len(l) for l in body)
        looks_heading = (
            len(first) < max(40, typical * 0.5)
            and first[:1].isupper()
            and first.rstrip(CLOSERS)[-1:] not in TERMINAL + ",;:"
            and body[1][:1].isupper()
        )
        if looks_heading:
            return body[1:], first
    return lines, title


# ── PDF helpers ─────────────────────────────────────────────────────────────
def parse_range(spec: str, n: int) -> list:
    if not spec:
        return list(range(1, n + 1))
    pages = set()
    for part in spec.split(","):
        part = part.strip()
        if "-" in part:
            a, b = part.split("-", 1)
            a = int(a) if a else 1
            b = int(b) if b else n
            pages.update(range(a, b + 1))
        elif part:
            pages.add(int(part))
    return sorted(p for p in pages if 1 <= p <= n)


def outline_titles(reader) -> dict:
    """PDF page index (1-based) → first outline title pointing at it."""
    titles = {}

    def walk(items):
        for it in items:
            if isinstance(it, list):
                walk(it)
                continue
            try:
                p = reader.get_destination_page_number(it) + 1
            except Exception:
                continue
            titles.setdefault(p, str(it.title).strip())

    try:
        walk(reader.outline)
    except Exception:
        pass
    return titles


ROMAN = {"i": 1, "v": 5, "x": 10, "l": 50, "c": 100}


def parse_chapter_number(line: str):
    """'7' → 7, 'XII' → 12, else None."""
    t = line.strip().rstrip(".").strip()
    if t.isdigit():
        return int(t)
    if t and all(ch in ROMAN for ch in t.lower()):
        vals = [ROMAN[ch] for ch in t.lower()]
        return sum(-v if i + 1 < len(vals) and v < vals[i + 1] else v for i, v in enumerate(vals))
    return None


def outline_chapters(reader) -> list:
    """Top-level outline entries as chapters: [(start_pdf_page, title)], in order."""
    out = []
    try:
        for it in reader.outline:
            if isinstance(it, list):
                continue
            try:
                out.append((reader.get_destination_page_number(it) + 1, str(it.title).strip()))
            except Exception:
                pass
    except Exception:
        pass
    out.sort()
    return out


def chapter_for(chapters: list, p: int):
    """(number, title) of the chapter containing PDF page p, or (None, None)."""
    cur = None
    for i, (start, title) in enumerate(chapters):
        if start <= p:
            cur = (i + 1, title)
        else:
            break
    return cur or (None, None)


MIN_FIG_SIDE = 90     # pt — smaller images are ornaments / dingbats
MIN_FIG_AREA = 0.03   # fraction of the page area


def page_figures(doc, idx0: int, title, page_dir: str, write: bool, n_paras: int,
                 min_side: float = MIN_FIG_SIDE, min_area: float = MIN_FIG_AREA) -> list:
    """Extract the page's illustrations (raster images ≥ MIN_FIG_SIDE/MIN_FIG_AREA)
    at source resolution as fig<k>.jpg, and place each after the paragraph the
    body text above it amounts to. Returns the figures.json entries."""
    page = doc[idx0]
    W, H = page.rect.width, page.rect.height
    infos = []
    for im in page.get_image_info(xrefs=True):
        r = pymupdf.Rect(im["bbox"]) & page.rect
        if r.width < min_side or r.height < min_side:
            continue
        if r.width * r.height < min_area * W * H:
            continue
        if not im.get("xref"):
            continue
        infos.append((r, im["xref"]))
    if not infos:
        return []
    infos.sort(key=lambda t: (t[0].y0, t[0].x0))
    # Body text blocks (skip junk lines and the lifted heading) with their chars.
    blocks = []
    for b in page.get_text("blocks"):
        if b[6] != 0:
            continue
        txt = " ".join(b[4].split())
        if not txt or JUNK_LINE.match(txt):
            continue
        if title and norm(txt) == norm(title):
            continue
        blocks.append((b[1], b[3], len(txt)))
    total = sum(c for _, _, c in blocks) or 1
    figs = []
    for k, (r, xref) in enumerate(infos, 1):
        above = sum(c for y0, y1, c in blocks if y1 <= r.y0 + 2)
        after = round(above / total * n_paras) if n_paras else 0
        after = max(0, min(n_paras, after))
        name = f"fig{k}.jpg"
        w = h = None
        if write:
            try:
                pix = pymupdf.Pixmap(doc, xref)
                if pix.alpha:
                    pix = pymupdf.Pixmap(pix, 0)
                if pix.n - pix.alpha >= 4 or pix.colorspace is None or pix.colorspace.n != 3:
                    pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
                while max(pix.width, pix.height) > 1800:
                    pix.shrink(1)
                pix.save(os.path.join(page_dir, name), jpg_quality=85)
                w, h = pix.width, pix.height
            except Exception:
                # Fall back to a page-clip render at 200 dpi.
                pix = page.get_pixmap(dpi=200, clip=r, colorspace=pymupdf.csRGB, alpha=False)
                pix.save(os.path.join(page_dir, name), jpg_quality=85)
                w, h = pix.width, pix.height
        figs.append({"file": name, "afterParagraph": after, "width": w, "height": h,
                     "y": round(r.y0 / H, 3)})
    return figs


def write_figures(page_dir: str, figs: list):
    # Illustrations replace the full-page render — never keep a photo of the text.
    for old in glob.glob(os.path.join(page_dir, "fig*.jpg")):
        if os.path.basename(old) not in {f["file"] for f in figs}:
            os.remove(old)
    try:
        os.remove(os.path.join(page_dir, "source.jpg"))
    except FileNotFoundError:
        pass
    with open(os.path.join(page_dir, "figures.json"), "w", encoding="utf-8") as f:
        f.write(json.dumps({"figures": figs}, ensure_ascii=False, indent=2) + "\n")


def printed_number(reader, idx0: int):
    try:
        lab = reader.page_labels[idx0]
        return int(lab) if lab and lab.isdigit() else None
    except Exception:
        return None


def render_jpeg(doc, idx0: int, dpi: int, dest: str):
    page = doc[idx0]
    pix = page.get_pixmap(dpi=dpi, colorspace=pymupdf.csRGB, alpha=False)
    pix.save(dest, jpg_quality=82)


# ── Main ────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(description="Ingest a PDF into bridge page folders.")
    ap.add_argument("pdf")
    ap.add_argument("--book", required=True, help="book title (must match the title used in the app)")
    ap.add_argument("--source", default="French", help="language of the PDF text (default French)")
    ap.add_argument("--target", default="English", help="learner's language for lessons (default English)")
    ap.add_argument("--translate-to", default=None, metavar="LANG",
                    help="the PDF is in --source; have the bridge translate each page into LANG first "
                         "and build the lessons on that (machine translation)")
    ap.add_argument("--pages", default="", help="PDF page range, e.g. 9-40 or 9,12,20-25 (default all)")
    ap.add_argument("--mode", choices=["text", "vision"], default="text")
    ap.add_argument("--number", choices=["printed", "pdf"], default="printed",
                    help="page label: the PDF's printed page label (default) or the raw PDF page index")
    ap.add_argument("--offset", type=int, default=0, help="add to every page label")
    ap.add_argument("--dpi", type=int, default=110, help="artwork render resolution (default 110)")
    ap.add_argument("--no-image", action="store_true", help="text mode: don't render source.jpg artwork")
    ap.add_argument("--no-carry", action="store_true",
                    help="don't move a page's trailing sentence fragment onto the next page")
    ap.add_argument("--no-titles", action="store_true", help="don't take page titles from the PDF outline")
    ap.add_argument("--chapters-from-numbers", metavar="LABEL", default=None,
                    help="the book marks chapters with a bare number/roman numeral as the first line of a page "
                         "(no outline): treat those as chapter starts titled '<LABEL> <n>', e.g. --chapters-from-numbers Hoofdstuk")
    ap.add_argument("--min-chars", type=int, default=40,
                    help="pages with fewer chars of text are picture pages (default 40)")
    ap.add_argument("--skip-pictures", action="store_true",
                    help="text mode: drop picture-only pages instead of keeping them as artwork-only pages")
    ap.add_argument("--picture-dpi", type=int, default=150,
                    help="render resolution for picture-only pages (default 150; maps need the detail)")
    ap.add_argument("--model", default=None, help="Claude model for the bridge to use (default: bridge default)")
    ap.add_argument("--force", action="store_true", help="overwrite pages that already have a lesson")
    ap.add_argument("--only", default="", metavar="PAGES",
                    help="write only these PDF pages (same syntax as --pages); the rest of --pages is still "
                         "read so sentences that spill across page breaks are handled the same as in a full run")
    ap.add_argument("--projects-dir", default=os.environ.get("PROJECTS_DIR", DEFAULT_PROJECTS))
    ap.add_argument("--min-figure-side", type=float, default=MIN_FIG_SIDE, metavar="PT",
                    help=f"smallest illustration side to keep, in points (default {MIN_FIG_SIDE}; lower it for books "
                         "with small drawings, e.g. 30 — ornaments are usually under 40)")
    ap.add_argument("--min-figure-area", type=float, default=MIN_FIG_AREA, metavar="FRAC",
                    help=f"smallest illustration area as a fraction of the page (default {MIN_FIG_AREA})")
    ap.add_argument("--no-figures", action="store_true",
                    help="don't extract illustrations (figures.json + fig<k>.jpg) — keep full-page renders instead")
    ap.add_argument("--refresh-assets", action="store_true",
                    help="for pages already on disk: (re)extract figures, drop full-page renders, and add chapter "
                         "info to status.json — no text changes, no Claude runs. Picture pages left with no "
                         "illustration are removed.")
    ap.add_argument("--dry-run", action="store_true", help="print what would be written, write nothing")
    args = ap.parse_args()

    if not os.path.isfile(args.pdf):
        sys.exit(f"No such file: {args.pdf}")
    reader = pypdf.PdfReader(args.pdf)
    n = len(reader.pages)
    pages = parse_range(args.pages, n)
    if not pages:
        sys.exit(f"No pages selected (PDF has {n}).")

    want_image = args.mode == "vision" or not args.no_image
    doc = None
    if want_image:
        if pymupdf is None:
            if args.mode == "vision":
                sys.exit("vision mode needs PyMuPDF:  pip3 install pymupdf")
            print("note: PyMuPDF not installed — pages will have no artwork (pip3 install pymupdf)")
        else:
            doc = pymupdf.open(args.pdf)

    translate = (args.translate_to or "").strip() or None
    if translate and translate.lower() == args.source.lower():
        sys.exit("--translate-to must differ from --source")
    if translate and args.mode == "vision":
        sys.exit("--translate-to needs the text layer (--mode text); vision pages are transcribed as-is")
    only = set(parse_range(args.only, n)) if args.only else None
    titles = {} if args.no_titles else outline_titles(reader)
    book_dir = os.path.join(os.path.abspath(args.projects_dir), mk_book_name(args.book))
    # Chapters = top-level outline entries, numbered from the first one that
    # contains an ingested page (front matter before --pages doesn't count).
    chapters = outline_chapters(reader)
    number_chapters = {}  # pdf page → (n, title), filled while walking pages (--chapters-from-numbers)
    if args.chapters_from_numbers:
        chapters = []  # numbered headings in the text replace the outline
    if chapters and pages:
        first = max((i for i, (start, _) in enumerate(chapters) if start <= pages[0]), default=0)
        chapters = chapters[first:]
    use_figures = doc is not None and not args.no_figures

    if args.refresh_assets:
        if doc is None:
            sys.exit("--refresh-assets needs PyMuPDF:  pip3 install pymupdf")
        refreshed = removed = nfig = 0
        for p in pages:
            label = (printed_number(reader, p - 1) if args.number == "printed" else None) or p
            label += args.offset
            page_dir = os.path.join(book_dir, f"Page{label}")
            if not os.path.isdir(page_dir):
                continue
            try:
                t = json.load(open(os.path.join(page_dir, "transcript.json"), encoding="utf-8"))
                n_paras = len(t.get("paragraphs", []))
                title = t.get("pageTitle")
            except Exception:
                n_paras, title = 0, titles.get(p)
            figs = page_figures(doc, p - 1, title, page_dir, not args.dry_run, n_paras,
                                args.min_figure_side, args.min_figure_area)
            ch_num, ch_title = chapter_for(chapters, p)
            if n_paras == 0 and not figs:
                print(f"pdf {p:>4} → Page{label:<4} text-only picture page, nothing to show — removed")
                if not args.dry_run:
                    shutil.rmtree(page_dir, ignore_errors=True)
                removed += 1
                continue
            print(f"pdf {p:>4} → Page{label:<4} {len(figs)} figure(s)"
                  + "".join(f" [after ¶{f['afterParagraph']}]" for f in figs)
                  + (f"  · ch.{ch_num} {ch_title}" if ch_num else ""))
            if not args.dry_run:
                if not args.no_figures:
                    write_figures(page_dir, figs)
                st_path = os.path.join(page_dir, "status.json")
                st = json.load(open(st_path, encoding="utf-8"))
                st["figures"] = len(figs)
                if not args.chapters_from_numbers:  # number-heading chapters were set at ingest; keep them
                    st.update({"chapter": ch_num, "chapterTitle": ch_title})
                json.dump(st, open(st_path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
            refreshed += 1
            nfig += len(figs)
        print()
        print(f"{'dry run — ' if args.dry_run else '✓ '}{refreshed} page(s) refreshed, {nfig} illustration(s), {removed} empty page(s) removed")
        if not args.dry_run and refreshed:
            print("Next: restart the bridge and Sync on the phone — figures and chapters are picked up on the next sync.")
        return

    # Whole-document pass first: which hyphenated words are real (kept when
    # re-joining line-break hyphenation), and the raw text per selected page.
    raw = {}
    known_hyphenated = set()
    if args.mode == "text":
        # PyMuPDF's text layer is cleaner (pypdf breaks words across line ends in
        # some PDFs); fall back to pypdf when PyMuPDF isn't installed.
        text_doc = doc if doc is not None else (pymupdf.open(args.pdf) if pymupdf else None)
        for p in pages:
            raw[p] = (text_doc[p - 1].get_text() if text_doc is not None else reader.pages[p - 1].extract_text()) or ""
        for t in raw.values():
            for m in re.finditer(r"\b([^\W\d_]+-[^\W\d_]+)\b", t):
                known_hyphenated.add(m.group(1).lower())

    written = skipped = pictures = 0
    carry = ""  # sentence fragment carried from the previous page
    for p in pages:
        label = (printed_number(reader, p - 1) if args.number == "printed" else None) or p
        label += args.offset
        page_dir = os.path.join(book_dir, f"Page{label}")
        tag = f"pdf {p:>4} → Page{label:<4}"

        if os.path.exists(os.path.join(page_dir, "lesson.json")) and not args.force:
            print(f"{tag}  skip (already has a lesson; --force to redo)")
            skipped += 1
            continue

        transcript = None
        if args.mode == "text":
            title = titles.get(p)
            if args.chapters_from_numbers:
                first = next((l.strip() for l in raw[p].replace("\u00a0", " ").split("\n") if l.strip()), "")
                num = parse_chapter_number(first)
                if num is not None:
                    number_chapters[p] = (num, f"{args.chapters_from_numbers} {num}")
                    title = title or f"{args.chapters_from_numbers} {num}"
            lines = clean_lines(raw[p])
            lines, title = lift_heading(lines, title)
            paras, last_open = lines_to_paragraphs(lines, known_hyphenated)
            # Decide on the page's OWN text whether it is a picture page, before
            # any carried-over fragment is merged in.
            own_chars = sum(len(pp) for pp in paras)
            picture = own_chars < args.min_chars
            if picture and (args.skip_pictures or doc is None):
                why = "no artwork without PyMuPDF" if doc is None else "--skip-pictures"
                print(f"{tag}  skip ({own_chars} chars of text; {why})")
                skipped += 1
                continue
            if picture:
                # Keep the page so the app's sequence mirrors the book (maps,
                # full-page art). Artwork + title only; the bridge finishes it
                # without a Claude run. A carried fragment waits for the next
                # text page rather than landing on a picture.
                paras = []
            else:
                if carry:
                    paras[0] = f"{carry} {paras[0]}"
                    carry = ""
                last_in_range = p == pages[-1]
                if not args.no_carry and not last_in_range and last_open and not ends_sentence(paras[-1]):
                    # Trailing fragment → belongs with the next page's first line.
                    sents = split_sentences(paras[-1])
                    if len(sents) > 1:
                        carry = sents[-1]
                        paras[-1] = " ".join(sents[:-1])
                    else:
                        carry = paras[-1]
                        paras = paras[:-1]
            transcript = {
                "pageTitle": title,
                "pageNumber": printed_number(reader, p - 1),
                "paragraphs": [split_sentences(pp) for pp in paras],
            }
            transcript["paragraphs"] = [s for s in transcript["paragraphs"] if s]
            n_sent = sum(len(s) for s in transcript["paragraphs"])

        if only is not None and p not in only:
            continue  # computed for carry-over context only
        if args.dry_run:
            if transcript and not transcript["paragraphs"]:
                print(f"{tag}  picture page (artwork only)"
                      + (f"  “{transcript['pageTitle']}”" if transcript["pageTitle"] else ""))
            elif transcript:
                print(f"{tag}  {len(transcript['paragraphs'])} paras / {n_sent} sentences"
                      + (f"  “{transcript['pageTitle']}”" if transcript["pageTitle"] else ""))
                for para in transcript["paragraphs"]:
                    for s in para:
                        print(f"        · {s}")
                    print()
            else:
                print(f"{tag}  render {args.dpi} dpi (vision)")
            continue

        # Fresh ingest of this page → clear derived artifacts, like a re-scan.
        os.makedirs(page_dir, exist_ok=True)
        for f in ("transcript.json", "native.txt", "original.json", "original.txt", "lesson.json", "page.html"):
            try:
                os.remove(os.path.join(page_dir, f))
            except FileNotFoundError:
                pass
        shutil.rmtree(os.path.join(page_dir, "audio"), ignore_errors=True)

        if args.chapters_from_numbers:
            starts = sorted((pp, v) for pp, v in number_chapters.items() if pp <= p)
            ch_num, ch_title = starts[-1][1] if starts else (None, None)
        else:
            ch_num, ch_title = chapter_for(chapters, p)
        figs = []
        if use_figures:
            n_paras = len(transcript["paragraphs"]) if transcript else 0
            figs = page_figures(doc, p - 1, transcript["pageTitle"] if transcript else titles.get(p),
                                page_dir, True, n_paras, args.min_figure_side, args.min_figure_area)
            write_figures(page_dir, figs)
            if transcript is not None and not transcript["paragraphs"] and not figs:
                # A picture page with no illustration is just a text-only page too short
                # to be a lesson (dedication, half-title) — nothing to show; drop it.
                shutil.rmtree(page_dir, ignore_errors=True)
                print(f"{tag}  text-only page with nothing to show — dropped")
                skipped += 1
                continue
        elif doc is not None:
            is_picture = transcript is not None and not transcript["paragraphs"]
            render_jpeg(doc, p - 1, args.picture_dpi if is_picture else args.dpi,
                        os.path.join(page_dir, "source.jpg"))

        status = {
            "status": "queued",
            "page": label,
            "book": args.book.strip(),
            "model": args.model,
            "sourceLanguage": translate or args.source,
            "targetLanguage": args.target,
            "queuedAt": int(time.time() * 1000),
            "origin": "pdf",
            "pdfPage": p,
            "chapter": ch_num,
            "chapterTitle": ch_title,
            "figures": len(figs),
        }
        if translate:
            status.update({"originalLanguage": args.source, "machineTranslated": True})
        if transcript and not transcript["paragraphs"]:
            # Picture page: an empty transcript in the book's language. The bridge
            # writes lesson.json/page.html for it straight away (no Claude).
            with open(os.path.join(page_dir, "transcript.json"), "w", encoding="utf-8") as f:
                f.write(json.dumps(transcript, ensure_ascii=False) + "\n")
            with open(os.path.join(page_dir, "native.txt"), "w", encoding="utf-8") as f:
                f.write("")
            status.update({"stage": "transcribed", "sentences": 0, "picture": True,
                           "detectedPage": transcript["pageNumber"]})
            status.pop("machineTranslated", None)
            pictures += 1
            print(f"{tag}  picture page (artwork only)")
        elif transcript and translate:
            # The bridge translates original.json → transcript.json (stage 1b),
            # then builds the lesson with the original passed through.
            with open(os.path.join(page_dir, "original.json"), "w", encoding="utf-8") as f:
                f.write(json.dumps(transcript, ensure_ascii=False) + "\n")
            with open(os.path.join(page_dir, "original.txt"), "w", encoding="utf-8") as f:
                f.write("\n\n".join(" ".join(s) for s in transcript["paragraphs"]) + "\n")
            status.update({"stage": "extracted", "sentences": n_sent,
                           "detectedPage": transcript["pageNumber"]})
            print(f"{tag}  {n_sent} {args.source} sentences (bridge will translate → {translate})")
        elif transcript:
            with open(os.path.join(page_dir, "transcript.json"), "w", encoding="utf-8") as f:
                f.write(json.dumps(transcript, ensure_ascii=False) + "\n")
            with open(os.path.join(page_dir, "native.txt"), "w", encoding="utf-8") as f:
                f.write("\n\n".join(" ".join(s) for s in transcript["paragraphs"]) + "\n")
            status.update({"stage": "transcribed", "sentences": n_sent,
                           "detectedPage": transcript["pageNumber"]})
            print(f"{tag}  {n_sent} sentences (stage 1 done)")
        else:
            print(f"{tag}  artwork only (Claude will transcribe)")
        with open(os.path.join(page_dir, "status.json"), "w", encoding="utf-8") as f:
            f.write(json.dumps(status, indent=2, ensure_ascii=False) + "\n")
        written += 1

    print()
    if args.dry_run:
        print(f"dry run — nothing written. {len(pages)} page(s) inspected, {skipped} would be skipped.")
        return
    print(f"✓ {written} page(s) written to {book_dir}"
          + (f" ({pictures} artwork-only)" if pictures else "")
          + (f", {skipped} skipped" if skipped else ""))
    if written:
        print("Next: (re)start the bridge — `node bridge/server.mjs` — it will recover these pages")
        stages = "translate + enrich" if translate else ("enrich" if args.mode == "text" else "transcribe + enrich")
        runs = "two Claude runs" if translate else "one Claude run"
        print(f"      and run the {stages} stage on each ({runs} per page on your Max plan).")
        print(f"      On the phone, create a book titled “{args.book.strip()}” ({translate or args.source} → {args.target}) and Sync.")


if __name__ == "__main__":
    main()
