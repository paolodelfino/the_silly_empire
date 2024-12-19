import { scTitle } from "@/utils/sc";

export const time = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const result = await scTitle(4287);
console.log(result);
