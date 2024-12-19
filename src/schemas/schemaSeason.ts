import { z } from "zod";

const schemaSeason = z
  .object({
    release_date: z.string().trim().min(1).nullable(),
    episodes: z.array(
      z.object({
        id: z.number().int().gte(0),
        number: z.number().int().gte(1),
        scws_id: z.number().int().gte(0),
        cover: z.string().trim().min(1),
      }),
    ),
  })
  .strip();
export default schemaSeason;
