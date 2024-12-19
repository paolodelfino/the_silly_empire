import ActionFetch__Title from "@/actions/ActionFetch__Title";
import schemaEntry__Details from "@/schemas/schemaEntry__Details";
import { FormValues } from "@/utils/form";
import { createQuery } from "@/utils/query";

const useQueryEntry = createQuery(
  (values: FormValues<typeof schemaEntry__Details>) =>
    ActionFetch__Title(values),
);
export default useQueryEntry;
