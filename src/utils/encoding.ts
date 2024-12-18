export function decodeUtf8(utf8_encoded: string): string {
  return decodeWithTable(utf8_encoded, {
    "\u00e8": "è",
    "\u0027": "'",
  });
}

export function decodeHtml(html_encoded: string): string {
  return decodeWithTable(html_encoded, {
    "&quot;": '"',
    "&#39;": "'",
    "&#039;": "'",
    "&amp;": "&",
  });
}

export function decodeWithTable(
  s: string,
  table: Record<string, string>,
): string {
  let replace = s;
  for (const key in table) {
    replace = replace.replace(new RegExp(key, "g"), table[key]);
  }
  return replace;
}
