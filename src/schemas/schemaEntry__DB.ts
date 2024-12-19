import schemaEntry__Query__DB from "@/schemas/schemaEntry__Query__DB";
import schemaEntry__Query__Form from "@/schemas/schemaEntry__Query__Form";
import { z } from "zod";

const schemaEntry__DB = z
  .object({
    original_name: z.string().trim().min(1),
    plot: z
      .string()
      .trim()
      .transform((arg) => (arg === "." ? undefined : arg)),
    quality: z.enum(["HD", "SD", "TS", "CAM"]),
    status: z.enum([
      "Canceled",
      "Post Production",
      "Returning Series",
      "Released",
      "Planned",
      "In Production",
      "Ended",
    ]),
    runtime: z.number().int().min(0).nullable(),
    scws_id: z.number().int().min(0).nullable(),
    netflix_id: z.number().int().nullable(),
    prime_id: z.string().trim().min(1).nullable(),
    disney_id: z.string().trim().min(1).nullable(),
    now_id: z.string().trim().min(1).nullable(),
    apple_id: z.string().trim().min(1).nullable(),
    paramount_id: z.literal(null),
    release_date: z.string().trim().min(1).nullable(),
    seasons: z.array(
      z.object({
        number: z.number().int(),
        episodes_count: z.number().int().gte(0),
        release_date: z.string().trim().min(1).nullable(),
      }),
    ),
    trailers: z
      .array(
        z.object({
          youtube_id: z.string().trim().min(1),
        }),
      )
      .min(0),
    genres: z.array(
      z.object({
        id: schemaEntry__Query__Form.shape.genre,
      }),
    ),
    keywords: z.array(
      z.object({
        name: z.string().trim().min(1),
      }),
    ),
    related: z.array(schemaEntry__Query__DB),
  })
  .merge(schemaEntry__Query__DB)
  .strict();
export default schemaEntry__DB;
