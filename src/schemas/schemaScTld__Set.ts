import { z } from "zod";

const schemaScTld__Set = z
  .object({
    value: z.string().trim().min(1),
  })
  .strict();
export default schemaScTld__Set;
