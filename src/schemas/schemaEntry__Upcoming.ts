import schemaEntry__Query__DB from "@/schemas/schemaEntry__Query__DB";
import { z } from "zod";

const schemaEntry__Upcoming = z
  .object({
    upcoming_seasons: z.array(
      z.object({
        id: z.number().gte(0).int(),
        number: z.number().gte(0).int(),
        name: z.literal(null),
        plot: z.literal(null),
        release_date: z.string(),
        title_id: z.number().gte(0).int(),
        created_at: z.string(),
        updated_at: z.string(),
      }),
    ),
  })
  .merge(schemaEntry__Query__DB);
export default schemaEntry__Upcoming;
