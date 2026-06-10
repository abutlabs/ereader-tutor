// Parse a DRM-free EPUB into pages of sentences (Hearth "direct text" lane).
// EPUB is a zip of XHTML; we read the OPF spine and strip each document to text.
// No native deps — JSZip + light XML/HTML handling.

import JSZip from "jszip";
import * as FileSystem from "expo-file-system/legacy";

const B64 = FileSystem.EncodingType.Base64;

export interface EpubChapter {
  paragraphs: string[][]; // paragraphs → sentences (source text)
}
export interface EpubDoc {
  title: string;
  author: string;
  language: string; // BCP-47 from OPF dc:language
  chapters: EpubChapter[];
}

function tag(xml: string, name: string): string | undefined {
  const m = xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? m[1].replace(/\s+/g, " ").trim() || undefined : undefined;
}
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&(?:apos|#39);/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}
function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}
function splitSentences(text: string): string[] {
  const m = text.match(/[^.!?…]+[.!?…]+["”’)]*|\S[^.!?…]*$/g);
  return (m || [text]).map((s) => s.trim()).filter((s) => s.length > 1);
}
function htmlToParagraphs(html: string): string[][] {
  const body = html.replace(/[\s\S]*?<body[^>]*>/i, "").replace(/<\/body>[\s\S]*/i, "");
  const blocks = body.match(/<p\b[\s\S]*?<\/p>/gi) || body.split(/<\/(?:div|h[1-6]|section|li)>/i);
  const out: string[][] = [];
  for (const b of blocks) {
    const text = stripTags(b);
    if (text.length < 2) continue;
    const sents = splitSentences(text);
    if (sents.length) out.push(sents);
  }
  return out;
}

export async function parseEpub(uri: string): Promise<EpubDoc> {
  const zip = await JSZip.loadAsync(await FileSystem.readAsStringAsync(uri, { encoding: B64 }), { base64: true });
  const container = await zip.file("META-INF/container.xml")?.async("string");
  const opfPath = container?.match(/full-path="([^"]+)"/i)?.[1];
  if (!opfPath) throw new Error("Not a valid EPUB (no OPF).");
  const opf = await zip.file(opfPath)!.async("string");

  const title = tag(opf, "dc:title") || "Untitled";
  const author = tag(opf, "dc:creator") || "Unknown";
  const language = tag(opf, "dc:language") || "en";

  // manifest id → href (handle either attribute order)
  const base = opfPath.includes("/") ? opfPath.slice(0, opfPath.lastIndexOf("/") + 1) : "";
  const items: Record<string, string> = {};
  for (const m of opf.matchAll(/<item\b[^>]*\bid="([^"]+)"[^>]*\bhref="([^"]+)"/gi)) items[m[1]] = m[2];
  for (const m of opf.matchAll(/<item\b[^>]*\bhref="([^"]+)"[^>]*\bid="([^"]+)"/gi)) items[m[2]] = m[1];
  const spine = [...opf.matchAll(/<itemref\b[^>]*\bidref="([^"]+)"/gi)].map((m) => m[1]);

  const chapters: EpubChapter[] = [];
  for (const idref of spine) {
    const href = items[idref];
    if (!href) continue;
    const path = base + decodeURIComponent(href.split("#")[0]);
    const file = zip.file(path) || zip.file(decodeURIComponent(href.split("#")[0]));
    if (!file) continue;
    const paragraphs = htmlToParagraphs(await file.async("string"));
    if (paragraphs.length) chapters.push({ paragraphs });
  }
  if (!chapters.length) throw new Error("Couldn't extract text from this EPUB.");
  return { title, author, language, chapters };
}
