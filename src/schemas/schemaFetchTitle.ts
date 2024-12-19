import schemaTitle from "@/schemas/schemaTitle";
import { z } from "zod";

const schemaFetchTitle = z.object({
  id: schemaTitle.shape.id,
});
export default schemaFetchTitle;
