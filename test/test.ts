import { scSearch } from "@/utils/sc";

export const time = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
