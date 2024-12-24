import { scPlaylist } from "@/utils/sc";

export const time = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const result = await scPlaylist("family", 215975, 7662, 52063);
console.log(result);

/* 
snoopy h=1
krave h=1 b=1
oceania2 h=1 b=1
titanic h=1
what we do in the shadows s4 e1

 */