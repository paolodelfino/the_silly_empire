import "client-only";
import Dexie, { type EntityTable } from "dexie";

interface ContinueWatchingTitle {
  titleId: number;
  seasonNumber?: number;
  episodeNumber?: number;
  poster: string;
  currentTime: number;
  maxTime: number;
  lastUpdated: Date;
}

const db = new Dexie("db") as Dexie & {
  continueWatchingTitle: EntityTable<ContinueWatchingTitle, "titleId">;
};

db.version(0.1).stores({
  continueWatchingTitle: "titleId, lastUpdated",
});

export { db };
export type { ContinueWatchingTitle };
