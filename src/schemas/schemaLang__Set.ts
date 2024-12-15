import { z } from "zod";

const schemaLang__Set = z.object({
  value: z.enum(["en", "it"]),
});
export default schemaLang__Set;
