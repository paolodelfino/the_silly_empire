import schemaEntry__DB from "@/schemas/schemaEntry__DB";
import { z } from "zod";

const schemaEntry__Details = z.object({
  id: schemaEntry__DB.shape.id,
});
export default schemaEntry__Details;
