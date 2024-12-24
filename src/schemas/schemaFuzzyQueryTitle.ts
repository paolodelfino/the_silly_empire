import { z } from "zod";

const schemaFuzzyQueryTitle = z
  .object({
    q: z.string().trim().min(0).optional(),
  })
  .strict();
export default schemaFuzzyQueryTitle;
