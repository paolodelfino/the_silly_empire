import schemaTitle from "@/schemas/schemaTitle";
import { z } from "zod";

const schemaFetchSeason = z.object({
  id: schemaTitle.shape.id,
  number: z.number().int().gte(1),
});
export default schemaFetchSeason;
