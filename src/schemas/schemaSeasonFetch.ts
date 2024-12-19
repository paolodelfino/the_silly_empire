import schemaEntry__Details from "@/schemas/schemaEntry__Details";
import { z } from "zod";

const schemaSeasonFetch = z.object({
  id: schemaEntry__Details.shape.id,
  number: z.number().int().gte(1),
});
export default schemaSeasonFetch;
