import ActionFetchTitle from "@/actions/ActionFetchTitle";
import schemaFetchTitle from "@/schemas/schemaFetchTitle";
import { FormValues } from "@/utils/form";
import { createQuery } from "@/utils/query";

const useQueryFetchTitle = createQuery(
  (values: FormValues<typeof schemaFetchTitle>) => ActionFetchTitle(values),
  {
    lastId: undefined as undefined | number,
  },
);
export default useQueryFetchTitle;
