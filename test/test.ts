import schemaSeason from "@/schemas/schemaSeason";
import { scSeason } from "@/utils/sc";

export const time = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const result = await scSeason(4287, 1);
console.log(result);
console.log(result.episodes.map(it => it.images));
console.log(schemaSeason.parse(result));
