import { z } from "zod";

const schemaSetLang = z
  .object({
    value: z.enum(["en", "it"]),
  })
  .strict();
export default schemaSetLang;
