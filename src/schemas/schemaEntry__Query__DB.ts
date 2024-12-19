import schemaImage__Entry from "@/schemas/schemaImage__Entry";
import { z } from "zod";

const schemaEntry__Query__DB = z
  .object({
    id: z.number().gte(0).int(),
    slug: z.string().trim().min(1),
    name: z.string().trim().min(1),
    type: z.enum(["tv", "movie"]),
    score: z.string().refine((value) => !Number.isNaN(Number(value))),
    last_air_date: z.string().nullable(),
    age: z.number().gte(0).int().nullable(),
    seasons_count: z.number().gte(0).int(),
    images: z.array(schemaImage__Entry),
  })
  .strict();
export default schemaEntry__Query__DB;
