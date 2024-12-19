import schemaQueryTitle from "@/schemas/schemaQueryTitle";
import schemaQueuedTitle from "@/schemas/schemaQueuedTitle";
import { z } from "zod";

const schemaTitle = z
  .object({
    status: z.enum([
      "Canceled",
      "Post Production",
      "Returning Series",
      "Released",
      "Planned",
      "In Production",
      "Ended",
    ]),
    scws_id: z.number().int().min(0).nullable(),
    imdb_id: z.number().int().nullable(),
    netflix_id: z.number().int().nullable(),
    prime_id: z.string().trim().min(1).nullable(),
    disney_id: z.string().trim().min(1).nullable(),
    now_id: z.string().trim().min(1).nullable(),
    apple_id: z.string().trim().min(1).nullable(),
    paramount_id: z.literal(null),
    seasons: z.array(
      z.object({
        number: z.number().int(),
        episodes_count: z.number().int().gte(0),
        release_date: z.string().trim().min(1).nullable(),
      }),
    ),
    genres: z.array(
      z.object({
        id: schemaQueryTitle.shape.genre,
      }),
    ),
    keywords: z.array(
      z.object({
        name: z.string().trim().min(1),
      }),
    ),
    related: z.array(schemaQueuedTitle),
    logo: z.string().trim().min(1),
    type: z.enum(["movie", "tv"]),
    background: z.string().trim().min(1),
    id: z.number().gte(0).int(),
  })
  .strict();
export default schemaTitle;
