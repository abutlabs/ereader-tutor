#!/usr/bin/env python3
# Bundle a bridge-built book (projects/<book>/Page<N>/…) into a Hearth package
# (.zip) — the same format the app's Export screen produces — so it can either
# be shared to a phone and imported, or shipped INSIDE the app as a bundled book
# (assets/books/<id>.zip, installed on first launch; see src/storage/bundled.ts).
#
#     python3 bridge/package-book.py "Atlas de Tolkien" --id atlas-de-tolkien \
#         --author "David Day" --language fr-FR --out assets/books/atlas-de-tolkien.zip
#
# Includes every page with a lesson.json: sentences (ids assigned exactly as the
# app does: p<page>-pg<para>-s<sent>), page titles, chapters, and the extracted
# illustrations (fig<k>.jpg → images/page-<NNN>-fig<k>.jpg). No progress/wordlist.

import argparse
import hashlib
import json
import os
import re
import sys
import time
import zipfile

try:
    from PIL import Image  # only needed for --figure-max / --figure-quality
except ImportError:
    Image = None
import io

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECTS = os.environ.get("PROJECTS_DIR", os.path.join(HERE, "..", "projects"))


def safe_name(title):
    s = re.sub(r"[^\w \-]", "", title.strip(), flags=re.U).strip()
    return re.sub(r"\s+", "_", s) or "Untitled"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("book", help="book title as the bridge knows it (projects/<folder>)")
    ap.add_argument("--id", required=True, help="book id / storage slug, e.g. atlas-de-tolkien")
    ap.add_argument("--author", default="Unknown")
    ap.add_argument("--language", required=True, help="BCP-47 of the text the learner reads, e.g. fr-FR")
    ap.add_argument("--target", default="English", help="language the lessons are written in")
    ap.add_argument("--level", default="A2")
    ap.add_argument("--source", default="", help="provenance / rights note stored in the book")
    ap.add_argument("--figure-max", type=int, default=0, metavar="PX",
                    help="re-encode illustrations so the longest side is at most PX (0 = keep as extracted)")
    ap.add_argument("--figure-quality", type=int, default=0, metavar="Q",
                    help="JPEG quality when re-encoding (with --figure-max; e.g. 65 for a phone-screen build)")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    book_dir = os.path.join(PROJECTS, safe_name(args.book))
    if not os.path.isdir(book_dir):
        sys.exit(f"No such book folder: {book_dir}")

    pages, chapters, images = [], {}, []
    for name in sorted(os.listdir(book_dir), key=lambda n: int(n[4:]) if n.startswith("Page") and n[4:].isdigit() else -1):
        if not name.startswith("Page"):
            continue
        pdir = os.path.join(book_dir, name)
        num = int(name[4:])
        try:
            lesson = json.load(open(os.path.join(pdir, "lesson.json"), encoding="utf-8"))
            st = json.load(open(os.path.join(pdir, "status.json"), encoding="utf-8"))
        except FileNotFoundError:
            print(f"  skip {name}: no lesson yet")
            continue
        paragraphs = []
        for pi, para in enumerate(lesson.get("paragraphs", [])):
            sents = para["sentences"] if isinstance(para, dict) else para
            paragraphs.append([
                {
                    "id": f"p{num}-pg{pi}-s{si}",
                    "dutch": s.get("dutch", ""),
                    "english": s.get("english", ""),
                    "words": s.get("words", []),
                    "notes": s.get("notes", []),
                }
                for si, s in enumerate(sents)
            ])
        page = {"page": num, "paragraphs": paragraphs}
        if lesson.get("pageTitle"):
            page["title"] = lesson["pageTitle"]
        if st.get("detectedPage") is not None:
            page["detectedPage"] = st["detectedPage"]
        if isinstance(st.get("chapter"), int):
            page["chapter"] = st["chapter"]
            chapters.setdefault(st["chapter"], st.get("chapterTitle") or f"Chapter {st['chapter']}")
        figs = []
        try:
            fj = json.load(open(os.path.join(pdir, "figures.json"), encoding="utf-8"))["figures"]
        except FileNotFoundError:
            fj = []
        for k, f in enumerate(fj, 1):
            src = os.path.join(pdir, f["file"])
            if not os.path.exists(src):
                continue
            arc = f"images/page-{num:03d}-fig{k}.jpg"
            images.append((src, arc))
            figs.append({"uri": f"fig{k}.jpg", "afterParagraph": f.get("afterParagraph", 0),
                         "width": f.get("width"), "height": f.get("height")})
        if figs:
            page["figures"] = figs
        pages.append(page)

    if not pages:
        sys.exit("No finished pages found.")
    now = int(time.time() * 1000)
    meta = {
        "title": args.book.strip(),
        "author": args.author,
        "language": args.language,
        "targetLanguage": args.target,
        "level": args.level,
        "status": "complete",
        "origin": "import",
        "chapters": [{"number": n, "title": t} for n, t in sorted(chapters.items())],
    }
    if args.source:
        meta["source"] = args.source
    book = {"id": args.id, "meta": meta, "pages": pages, "createdAt": now, "updatedAt": now}
    book_json = json.dumps(book, ensure_ascii=False, separators=(",", ":"))
    manifest = {
        "formatVersion": 1,
        "exportedAt": now,
        "book": {"id": args.id, "title": meta["title"], "author": args.author,
                 "language": args.language, "status": "complete"},
        "pageCount": len(pages),
        "sha256": hashlib.sha256(book_json.encode("utf-8")).hexdigest(),
        "flags": {"photos": bool(images), "progress": False, "wordlist": False},
        "source": args.source or None,
    }
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    with zipfile.ZipFile(args.out, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("book.json", book_json)
        z.writestr("manifest.json", json.dumps(manifest, indent=2, ensure_ascii=False))
        for src, arc in images:
            if args.figure_max or args.figure_quality:
                if Image is None:
                    sys.exit("--figure-max/--figure-quality need Pillow:  pip3 install pillow")
                im = Image.open(src).convert("RGB")
                if args.figure_max:
                    im.thumbnail((args.figure_max, args.figure_max), Image.LANCZOS)
                buf = io.BytesIO()
                im.save(buf, "JPEG", quality=args.figure_quality or 80, optimize=True, progressive=True)
                z.writestr(arc, buf.getvalue(), compress_type=zipfile.ZIP_STORED)
            else:
                z.write(src, arc, compress_type=zipfile.ZIP_STORED)  # JPEGs don't compress
    n_s = sum(len(p) for pg in pages for p in pg["paragraphs"])
    print(f"✓ {args.out}: {len(pages)} pages, {n_s} sentences, {len(images)} illustrations, "
          f"{len(chapters)} chapters, {os.path.getsize(args.out) / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
