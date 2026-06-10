// Parse an Adobe `.acsm` fulfillment ticket's PLAINTEXT metadata only — never
// any DRM. An .acsm is a small XML "download ticket", not a book. We read the
// bibliographic fields + loan expiry to show the user honest guidance.

import * as FileSystem from "expo-file-system/legacy";

export interface AcsmInfo {
  fileName: string;
  title?: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  language?: string;
  distributor?: string; // operator host (e.g. digitaldistribution.cb.nl)
  until?: string; // display-permission expiry (loan end)
}

function tag(xml: string, name: string): string | undefined {
  const m = xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? m[1].replace(/\s+/g, " ").trim() || undefined : undefined;
}

export async function parseAcsm(uri: string, fileName: string): Promise<AcsmInfo> {
  const xml = await FileSystem.readAsStringAsync(uri); // utf-8
  const operator = tag(xml, "operatorURL") || tag(xml, "operator");
  let distributor: string | undefined;
  if (operator) {
    try {
      distributor = new URL(operator).host;
    } catch {
      distributor = operator;
    }
  }
  return {
    fileName,
    title: tag(xml, "dc:title"),
    author: tag(xml, "dc:creator"),
    publisher: tag(xml, "dc:publisher"),
    isbn: tag(xml, "dc:identifier"),
    language: tag(xml, "dc:language"),
    distributor,
    until: tag(xml, "until"),
  };
}
