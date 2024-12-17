import { z } from "zod";

const schemaImage__Entry = z
  .object({
    imageable_id: z.number().positive().int(),
    imageable_type: z.enum(["title"]),
    filename: z.string().trim().min(1),
    type: z.enum(["cover", "cover_mobile", "poster", "logo", "background"]),
    original_url_field: z.null(),
  })
  .strict();
export default schemaImage__Entry;
