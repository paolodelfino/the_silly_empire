import { z } from "zod";

const schemaFetchPlaylist = z.object({
  scwsId: z.number().int().min(0),
  titleId: z.number().int().gte(0),
  episodeId: z.number().int().gte(1).optional(),
});
export default schemaFetchPlaylist;
