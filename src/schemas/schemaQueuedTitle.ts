import { z } from "zod";

const schemaQueuedTitle = z
  .object({
    id: z.number().gte(0).int(),
    poster: z.string().trim().min(1),
  })
  .strict();
export default schemaQueuedTitle;
