import schemaEntry__Query__Form from "@/schemas/schemaEntry__Query__Form";
import { FormValues } from "@/utils/form";
import { createInfiniteQuery } from "@/utils/query";
import { scSearch } from "@/utils/sc";

const useQueryEntry__Query = createInfiniteQuery(
  60,
  (offset, limit, values: FormValues<typeof schemaEntry__Query__Form>) =>
    scSearch(offset, values),
);
export default useQueryEntry__Query;
