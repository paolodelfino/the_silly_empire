import { z } from "zod";

const schemaFetchUpcoming = z.object({
  offset: z.number().int().gte(0),
});
export default schemaFetchUpcoming;
