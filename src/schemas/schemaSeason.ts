import schemaImage__Entry from "@/schemas/schemaImage__Entry";
import { z } from "zod";

const schemaSeason = z.object({
  release_date: z.string().trim().min(1).nullable(),
  episodes: z.array(
    z.object({
      id: z.number().int().gte(0),
      number: z.number().int().gte(1),
      name: z.string().trim().min(1),
      plot: z.string().trim().min(1),
      duration: z.number().int().gte(0),
      scws_id: z.number().int().gte(0),
      season_id: z.number().int().gte(0),
      images: z.array(schemaImage__Entry),
    }),
  ),
});
export default schemaSeason;
