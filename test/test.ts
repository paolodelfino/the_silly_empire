import { scFeatured } from "@/utils/sc"

export const time = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

await scFeatured();
