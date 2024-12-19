import { z } from "zod";

const schemaSetScTld = z
  .object({
    value: z.string().trim().min(1),
  })
  .strict();
export default schemaSetScTld;
