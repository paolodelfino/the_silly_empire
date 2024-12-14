import "client-only";

export function rem(px: string | number) {
  const n = typeof px === "string" ? parseFloat(px) : px;
  const font = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return n / font;
}

export function getDefaultFontSize() {
  const width = window.screen.width;
  if (width >= 2560) return 28;
  else if (width >= 1920) return 24;
  else return 16;
}
