export function rem(px: string | number) {
  const n = typeof px === "string" ? parseFloat(px) : px;
  const font = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return n / font;
}
