import { scTitle } from "@/utils/sc";

export const time = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const result = await scTitle(115);
console.log(result);
