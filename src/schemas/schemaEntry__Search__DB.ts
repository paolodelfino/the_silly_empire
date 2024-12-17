import schemaImage__Entry from "@/schemas/schemaImage__Entry";
import { z } from "zod";

const schemaEntry__Search__DB = z
  .object({
    id: z.number().positive().int(),
    slug: z.string().trim().min(1),
    name: z.string().trim().min(1),
    type: z.enum(["tv", "movie"]),
    score: z.string().refine((value) => !Number.isNaN(Number(value))),
    sub_it: z.union([z.literal(0), z.literal(1)]),
    last_air_date: z.string().nullable(),
    age: z.number().positive().int().nullable(),
    seasons_count: z.number().positive().int(),
    images: z.array(schemaImage__Entry),
  })
  .strict();
export default schemaEntry__Search__DB;
